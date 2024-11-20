import React from 'react'

export function ErrorMessage({ message }) {
  if (!message) return null

  return (
    <p className="text-red-500 text-xs mt-1" role="alert">
      {message}
    </p>
  )
}

export default ErrorMessage;