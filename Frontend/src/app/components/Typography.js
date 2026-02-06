// File: components/Typography.js
export function H1({ children }) {
  return <h1 className="text-3xl font-semibold">{children}</h1>
}
export function H2({ children }) {
  return <h2 className="text-2xl font-semibold">{children}</h2>
}
export function P({ children }) {
  return <p className="text-sm text-slate-700">{children}</p>
}