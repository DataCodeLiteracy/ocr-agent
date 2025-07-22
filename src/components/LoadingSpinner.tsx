interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  color?: "primary" | "white"
  text?: string
}

export default function LoadingSpinner({
  size = "md",
  color = "primary",
  text,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }

  const colorClasses = {
    primary: "text-blue-600",
    white: "text-white",
  }

  return (
    <div className='flex flex-col items-center justify-center'>
      <div
        className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin rounded-full border-2 border-gray-300 border-t-current`}
      />
      {text && <p className='mt-2 text-sm text-gray-600'>{text}</p>}
    </div>
  )
}
