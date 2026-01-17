<script setup lang="ts">
import type { SelectOption } from './components/FormField.vue'
import type { FFTable, Result } from './lib/types'
import { computed, reactive, ref } from 'vue'
import FormField from './components/FormField.vue'
import ResultCard from './components/ResultCard.vue'
import { calculateMetrics } from './lib/calculate'
import { applyCalibration } from './lib/calibration'
import { useDialog } from './lib/modal'
import { parseFFE, parseFFTab, parseMMANA } from './lib/parser'
import { validateFFTab } from './lib/validations'

// Setup State
const loading = ref(false)
const error = ref<string | null>(null)
const result = ref<Result | null>(null)
const { confirm: confirmDialog, alert: alertDialog } = useDialog()

const form = reactive({
  skyTemp: 20,
  earthTemp: 350,
  translineLoss: 0.20,
  receiverNF: 0.75,
  fileFormat: 'fft' as 'fft' | 'mmana' | 'ffe',
  file: null as File | null,
  frequency: null as number | null,
})

const formatOptions: SelectOption[] = [
  { value: 'fft', label: 'FFtab (.txt)' },
  { value: 'mmana', label: 'MMANA (.csv)' },
  { value: 'ffe', label: 'FEKO Far Field (.ffe)' },
]

const currentFileMeta = computed(() => {
  if (form.fileFormat === 'mmana') {
    return { accept: '.csv', label: 'MMANA-GAL Export (.csv)', showFreq: true }
  }
  if (form.fileFormat === 'ffe') {
    return { accept: '.ffe,.txt', label: 'FEKO Far Field (.ffe)', showFreq: false }
  }
  return { accept: '.txt', label: 'Far Field Table (FFTab)', showFreq: false }
})

function onFileUpdate(file: File | null) {
  form.file = file
  // Reset result on file change to avoid stale data
  result.value = null
  error.value = null
}

function onFormatChange(val: string) {
  form.fileFormat = val as any
  form.file = null
  form.frequency = null
  result.value = null
}

async function handleCalculate() {
  error.value = null
  loading.value = true
  result.value = null

  try {
    // Validation
    if (!form.file)
      throw new Error('Please select an antenna pattern file.')
    if (form.skyTemp <= 0)
      throw new Error('Sky temperature must be > 0 K.')
    if (form.earthTemp <= 0)
      throw new Error('Earth temperature must be > 0 K.')
    if (form.fileFormat === 'mmana' && (!form.frequency || form.frequency <= 0)) {
      throw new Error('MMANA format requires a valid frequency (MHz).')
    }

    const fileText = await form.file.text()
    let data: FFTable

    // Parsing
    if (form.fileFormat === 'mmana') {
      data = parseMMANA(fileText)
    }
    else if (form.fileFormat === 'ffe') {
      data = parseFFE(fileText)
    }
    else {
      data = parseFFTab(fileText)
    }

    // Check for "Calibration Needed" (Max gain not at 90/0)
    // Basic logic from old store
    let maxGainVal = -Infinity
    let maxTheta = 0
    let maxPhi = 0
    for (let t = 0; t <= 180; t++) {
      for (let p = 0; p <= 360; p++) {
        if (data.table[t]![p]! > maxGainVal) {
          maxGainVal = data.table[t]![p]!
          maxTheta = t
          maxPhi = p
        }
      }
    }

    const isThetaAligned = Math.abs(maxTheta - 90) < 1
    const isPhiAligned = Math.abs(maxPhi) < 1 || Math.abs(maxPhi - 360) < 1

    if (!isThetaAligned || !isPhiAligned) {
      const msg = `Max Gain is not aligned to Horizon/Front.\nTheta=${maxTheta}° (Exp: 90°), Phi=${maxPhi}° (Exp: 0°).\n\nDo you want to apply Zero Calibration?`
      if (await confirmDialog(msg, 'Calibration Needed')) {
        data = applyCalibration(data, true, true)
      }
      else {
        throw new Error('Calculation aborted. Uncalibrated data.')
      }
    }

    // Validate Data Quality
    const validation = validateFFTab(data)
    if (!validation.isValid) {
      throw new Error(validation.error || 'Unknown Validation Error')
    }

    // Calculate
    result.value = calculateMetrics(data, {
      skyTemp: form.skyTemp,
      earthTemp: form.earthTemp,
      translineLoss: form.translineLoss,
      receiverNF: form.receiverNF,
      file: form.file,
    })
  }
  catch (e: any) {
    const errorMsg = e.message || String(e)
    error.value = errorMsg
    await alertDialog(errorMsg, 'Error')
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-neutral-900 text-slate-200 py-10 px-4 md:px-8">
    <div class="max-w-2xl mx-auto space-y-8">
      <!-- Header -->
      <header class="space-y-1 mb-8">
        <h1 class="text-2xl font-bold text-white tracking-wide">
          AGTC Web Utility
        </h1>
        <div class="text-green-400 font-bold text-lg leading-relaxed">
          Based on "AGTC_anyGTa_2lite"<br>
          G/Ta computation from Far Field Table by F5FOD with DG7YBN
        </div>
      </header>

      <!-- Input Form -->
      <div class="space-y-6">
        <FormField
          label="Sky Temperature"
          memo="K"
          type="number"
          :value="form.skyTemp"
          :min="0"
          @update="(v) => form.skyTemp = v"
        />
        <FormField
          label="Earth Temperature"
          memo="K"
          type="number"
          :value="form.earthTemp"
          :min="0"
          @update="(v) => form.earthTemp = v"
        />
        <FormField
          label="Trans. Line Loss"
          memo="dB"
          type="number"
          :value="form.translineLoss"
          :step="0.01"
          :min="0"
          @update="(v) => form.translineLoss = v"
        />
        <FormField
          label="Receiver NF"
          memo="dB"
          type="number"
          :value="form.receiverNF"
          :step="0.01"
          :min="0"
          @update="(v) => form.receiverNF = v"
        />
        <FormField
          label="File Format"
          type="select"
          :value="form.fileFormat"
          :options="formatOptions"
          @update="onFormatChange"
        />
        <FormField
          label="Far Field Table (FFTab) file"
          :memo="currentFileMeta.accept"
          type="file"
          :accept="currentFileMeta.accept"
          @update="onFileUpdate"
        />
        <FormField
          v-if="currentFileMeta.showFreq"
          label="Frequency"
          memo="MHz"
          type="number"
          :value="form.frequency"
          :min="0.1"
          :step="0.001"
          @update="(v) => form.frequency = v"
        />

        <div class="mt-8 pt-4">
          <button
            :disabled="loading"
            class="rounded bg-sky-600 px-6 py-2.5 text-base font-semibold text-white shadow-sm hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            @click="handleCalculate"
          >
            {{ loading ? 'Calculating...' : 'Calculate' }}
          </button>
        </div>
      </div>

      <!-- Result Card -->
      <ResultCard v-if="result" :data="result" />
    </div>
  </div>
</template>
