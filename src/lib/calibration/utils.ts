export const DEG2RAD = Math.PI / 180.0
export const RAD2DEG = 180.0 / Math.PI

/**
 * Interpolation helper valid for the grid structure
 */
export function getInterpolatedValue(grid: Float64Array[], theta: number, phi: number): number {
  let t = theta
  if (t < 0)
    t = 0
  if (t > 180)
    t = 180

  // Phi wrap
  let p = phi % 360
  if (p < 0)
    p += 360

  const t0 = Math.floor(t)
  const t1 = Math.ceil(t)
  const p0 = Math.floor(p)
  const p1 = Math.ceil(p) // If p=360.5 -> p0=360, p1=361 -> need wrap logic for grid access

  // Access with safety
  const getVal = (r: number, c: number) => {
    // Wrap phi col if needed
    if (c >= 361)
      c = c % 360
    return grid[r]![c]
  }

  const v00 = getVal(t0, p0)!
  const v01 = getVal(t0, p1)!
  const v10 = getVal(t1, p0)!
  const v11 = getVal(t1, p1)!

  // -100 is "no data", handle it?
  // User code uses -999 for default. We use -100.
  // Linear Interpolation
  const st = t - t0
  const sp = p - p0

  // Bilinear
  const top = v00 + (v01 - v00) * sp
  const bot = v10 + (v11 - v10) * sp
  const result = top + (bot - top) * st

  return result
}
