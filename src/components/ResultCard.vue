<script setup lang="ts">
import type { Result } from '../types'
import { ref } from 'vue'
import ResultTable from './ResultTable.vue'

const props = defineProps<{ data: Result }>()

const { avgGainNum, avgGaindB, La, maxGainVal, maxPhi, maxTheta, skyTemp, earthTemp, rows, systemAt30 } = props.data
const { GTsys, receiverTemp, transLineTemp } = systemAt30

const cardRef = ref<HTMLElement | null>(null)

async function exportPNG() {
  if (!cardRef.value)
    return

  const html2canvas = (await import('html2canvas')).default
  const canvas = await html2canvas(cardRef.value, {
    backgroundColor: '#000000',
    scale: 2,
    useCORS: true,
  })
  const link = document.createElement('a')
  link.download = 'agtc-result.png'
  link.href = canvas.toDataURL('image/png')
  link.click()
}

function exportCSV() {
  const header = ['Alpha (deg)', 'T_pattern (K)', 'T_loss (K)', 'T_total (K)', 'G/T (dB/K)']
  const body = rows.map(row => [
    row.alpha.toFixed(1),
    row.T_pattern.toFixed(2),
    row.T_loss.toFixed(2),
    row.T_total.toFixed(2),
    row.G_Ta_dB.toFixed(2),
  ])
  const csv = [header, ...body].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'agtc_data.csv'
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="space-y-4 font-mono">
    <div ref="cardRef" class="bg-black p-6 rounded-md border border-gray-800">
      <header class="mb-4 text-sm leading-relaxed text-white">
        <div>
          Average Gain (AG) = <b>{{ avgGainNum.toFixed(4) }}</b> (/) = <b>{{ avgGaindB.toFixed(2) }}</b> dBi,
          Loss Factor L_a = <b>{{ La.toFixed(4) }}</b> (/)
        </div>
        <div>
          Max Gain = <b>{{ maxGainVal.toFixed(2) }}</b> dBi at azimuth = <b>{{ maxPhi }}</b> degrees and elevation = <b>{{ 90 - maxTheta }}</b> degrees
        </div>
        <div class="mt-1 font-bold">
          <span class="text-blue-600">T<sub>sky</sub> = {{ skyTemp.toFixed(2) }} K</span>
          <span class="ml-4 text-blue-600">T<sub>earth</sub> = {{ earthTemp.toFixed(2) }} K</span>
        </div>
      </header>

      <ResultTable :rows="rows" class="mb-6" />

      <footer class="text-center">
        <div class="text-amber-400 font-bold text-sm">
          G/Tsys = {{ GTsys.toFixed(2) }} dB/K (alpha = 30 deg. T<sub>rec</sub> = {{ receiverTemp.toFixed(2) }} K, T<sub>TL</sub> = {{ transLineTemp.toFixed(2) }} K)
        </div>
        <div v-if="avgGainNum >= 1.001" class="text-fuchsia-400 mt-2 font-bold text-sm">
          Computed AG >= 1.001, G/Ta calculation might be invalid.
        </div>
      </footer>
    </div>

    <div class="flex gap-3 pt-2">
      <button
        class="rounded bg-green-600 hover:bg-green-500 border border-[rgba(27,31,36,0.15)] px-4 py-1.5 text-sm font-bold text-white shadow transition-colors"
        @click="exportPNG"
      >
        Export PNG
      </button>
      <button
        class="rounded bg-green-600 hover:bg-green-500 border border-[rgba(27,31,36,0.15)] px-4 py-1.5 text-sm font-bold text-white shadow transition-colors"
        @click="exportCSV"
      >
        Export CSV
      </button>
    </div>
  </div>
</template>
