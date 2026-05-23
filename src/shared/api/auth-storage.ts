export const authStorage = {
  getRefresh: () => localStorage.getItem('r_rt') ?? undefined,
  setRefresh: (t: string) => localStorage.setItem('r_rt', t),
  clear: () => localStorage.removeItem('r_rt'),
}
