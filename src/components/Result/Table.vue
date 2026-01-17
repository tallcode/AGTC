<script setup lang="ts">
import type { ResultRow } from '@/types'

defineProps<{ rows: ResultRow[] }>()

// Formatting helper to match the screenshot style
function format(n: number) {
  const abs = Math.abs(n).toFixed(3)
  const sign = n >= 0 ? '+' : '-'
  return `${sign} ${abs}`
}

function formatK(n: number) {
  return n.toFixed(3)
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full text-sm font-mono border-collapse">
      <thead>
        <tr class="text-amber-300 border-b border-gray-800">
          <th class="px-4 py-1 text-center font-bold">
            Alpha (deg.)
          </th>
          <th class="px-4 py-1 text-center font-bold">
            T<sub class="text-[0.7em]">pattern</sub> (K)
          </th>
          <th class="px-4 py-1 text-center font-bold">
            T<sub class="text-[0.7em]">loss</sub> (K)
          </th>
          <th class="px-4 py-1 text-center font-bold">
            T<sub class="text-[0.7em]">total</sub> (K)
          </th>
          <th class="px-4 py-1 text-center font-bold">
            G/Ta (dB)
          </th>
        </tr>
      </thead>
      <tbody class="text-yellow-300">
        <tr
          v-for="row in rows"
          :key="row.alpha"
          class=""
          :class="{ 'text-red-500 font-bold': row.alpha === 30 }"
        >
          <td class="px-4 py-0.5 text-center">
            {{ row.alpha }}
          </td>
          <td class="px-4 py-0.5 text-right">
            {{ formatK(row.T_pattern) }}
          </td>
          <td class="px-4 py-0.5 text-right">
            {{ format(row.T_loss) }}
          </td>
          <td class="px-4 py-0.5 text-right">
            {{ format(row.T_total) }}
          </td>
          <td class="px-4 py-0.5 text-right">
            {{ row.G_Ta_Str || format(row.G_Ta_dB) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
