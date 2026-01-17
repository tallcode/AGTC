<script setup lang="ts">
import type { SelectOption } from '@/components/Form/types'
import type { FFTable, Result } from '@/types'
import { computed, reactive, ref } from 'vue'
import { Field, FileInput, NumberInput, SelectInput } from '@/components/Form'
import ResultCard from '@/components/Result/index.vue'
import { calculateMetrics } from '@/lib/calculate'
import { calibration, detect } from '@/lib/calibration'
import { useDialog } from '@/lib/modal'
import { parseFFE, parseFFTab, parseMMANA } from '@/lib/parser'
import { validateFFTab } from '@/lib/validations'

// DOM Refs
const skyTempField = ref<InstanceType<typeof Field> | null>(null)
const earthTempField = ref<InstanceType<typeof Field> | null>(null)
const translineLossField = ref<InstanceType<typeof Field> | null>(null)
const receiverNFField = ref<InstanceType<typeof Field> | null>(null)
const fileField = ref<InstanceType<typeof Field> | null>(null)
const frequencyField = ref<InstanceType<typeof Field> | null>(null)

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
  { value: 'fft', label: 'Far Field Table (.txt)' },
  { value: 'mmana', label: 'MMANA (.csv)' },
  { value: 'ffe', label: 'FEKO Far Field (.ffe)' },
]

const currentFileMeta = computed(() => {
  if (form.fileFormat === 'mmana') {
    return { accept: '.csv', label: 'MMANA-GAL Export (.csv)', showFreq: true }
  }
  else if (form.fileFormat === 'ffe') {
    return { accept: '.ffe', label: 'FEKO Far Field (.ffe)', showFreq: false }
  }
  else {
    return { accept: '.txt', label: 'Far Field Table (FFTab)', showFreq: false }
  }
})

function onFileUpdate(file: File | null) {
  form.file = file
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
    const checks = [
      skyTempField.value?.validate(form.skyTemp),
      earthTempField.value?.validate(form.earthTemp),
      translineLossField.value?.validate(form.translineLoss),
      receiverNFField.value?.validate(form.receiverNF),
      fileField.value?.validate(form.file),
      currentFileMeta.value.showFreq ? frequencyField.value?.validate(form.frequency) : true,
    ]

    if (checks.includes(false)) {
      return
    }

    if (!form.file)
      throw new Error('Please select an antenna pattern file.')

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

    // Validate Data Quality (First)
    const validation = validateFFTab(data)
    if (!validation.isValid) {
      throw new Error(validation.error || 'Unknown Validation Error')
    }

    // Check for "Calibration Needed"
    const calibrationCheck = detect(data)
    if (calibrationCheck.needed) {
      const msg = `Max Gain is not aligned to Horizon/Front.\n${calibrationCheck.reason}.\n\nCalibration is required to proceed. Do you want to apply Zero Calibration?`
      if (await confirmDialog(msg, 'Calibration Required')) {
        data = calibration(data, true, true)
      }
      else {
        // Must calibrate to proceed
        result.value = null
        throw new Error('Calculation aborted. Zero Calibration is required.')
      }
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
      <header class="space-y-1 mb-8 px-4">
        <h1 class="text-2xl font-bold text-white tracking-wide">
          AGTC Web Utility
        </h1>
        <div class="text-green-400 font-bold text-lg leading-relaxed">
          Based on "AGTC_anyGTa_2lite"<br>
          G/Ta computation from Far Field Table by F5FOD with DG7YBN
        </div>
      </header>

      <ResultCard
        v-if="result" :data="result"
        @reset="result = null"
      />
      <div v-else class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field ref="skyTempField" label="Sky Temperature" memo="K" required :min="0" :max="9999999">
            <NumberInput
              v-model="form.skyTemp"
              :min="0"
              :max="9999999"
              :step="1"
            />
          </Field>

          <Field ref="earthTempField" label="Earth Temperature" memo="K" required :min="0" :max="9999999">
            <NumberInput
              v-model="form.earthTemp"
              :min="0"
              :max="9999999"
              :step="1"
            />
          </Field>

          <Field ref="translineLossField" label="Trans. Line Loss" memo="dB" required :min="0">
            <NumberInput
              v-model="form.translineLoss"
              :min="0"
              :step="0.01"
            />
          </Field>

          <Field ref="receiverNFField" label="Receiver NF" memo="dB" required :min="0">
            <NumberInput
              v-model="form.receiverNF"
              :min="0"
              :step="0.01"
            />
          </Field>
        </div>

        <Field
          ref="fileField"
          label="File"
          required
        >
          <div class="flex flex-col sm:flex-row divide-y sm:divide-y-0 divide-gray-700">
            <div class="sm:w-1/3 min-w-37.5">
              <SelectInput
                :model-value="form.fileFormat"
                :options="formatOptions"
                @update:model-value="onFormatChange"
              />
            </div>
            <div class="flex-1">
              <FileInput
                :accept="currentFileMeta.accept"
                @update:model-value="onFileUpdate"
              />
            </div>
          </div>
        </Field>

        <Field
          v-if="currentFileMeta.showFreq"
          ref="frequencyField"
          label="Frequency"
          memo="MHz"
          required
          :min="0.1"
        >
          <NumberInput
            v-model="form.frequency"
            :min="0.1"
            :step="0.001"
          />
        </Field>

        <div class="mt-4">
          <button
            :disabled="loading"
            class="rounded bg-sky-600 px-6 py-2.5 text-base font-semibold text-white shadow-sm hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            @click="handleCalculate"
          >
            Calculate
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
