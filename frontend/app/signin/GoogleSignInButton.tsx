import React from 'react'

type GoogleSignInButtonProps = {
  onClick: () => void
  disabled?: boolean
  children?: React.ReactNode
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ onClick, disabled, children }) => {
  return (
    <button
      className='h-16 w-full bg-white hover:opacity-70 disabled:opacity-50 transition-opacity duration-300 ease-in-out rounded-md flex items-center justify-center space-x-3 p-2 border'
      onClick={onClick}
      disabled={disabled}
    >
      <img src='/google-logo.png' alt="Google logo" className='h-10' />
      <span className='text-black text-lg'>{children ?? 'Sign in with Google'}</span>
    </button>
  );
}

export default GoogleSignInButton