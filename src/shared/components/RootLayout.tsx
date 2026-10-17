import { Outlet, ScrollRestoration } from 'react-router-dom'

/** Opens every new page at the top (or at its #hash) and restores scroll on back/forward. */
export function RootLayout() {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  )
}
