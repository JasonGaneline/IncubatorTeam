import { useState } from 'react'
import { signupDoctor } from '../../utils/authApi.js'
import { saveAuthSession } from '../../utils/authApi.js'
import { useNavigate } from 'react-router-dom'
import { Button } from './Button.jsx'
import { TextField } from './TextField.jsx'

export function DoctorSignupForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    npiNumber: '',
    displayName: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signupDoctor({
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        npi_number: formData.npiNumber,
        display_name: formData.displayName
      })
      saveAuthSession(result)
      navigate('/profile')
    } catch (err) {
      setError(err.message || 'Signup failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField
        label="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <TextField
        label="Password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        required
      />
      <TextField
        label="First Name"
        name="firstName"
        value={formData.firstName}
        onChange={handleChange}
        required
      />
      <TextField
        label="Last Name"
        name="lastName"
        value={formData.lastName}
        onChange={handleChange}
        required
      />
      <TextField
        label="NPI Number"
        name="npiNumber"
        value={formData.npiNumber}
        onChange={handleChange}
        maxLength="10"
        required
      />
      <TextField
        label="Display Name"
        name="displayName"
        value={formData.displayName}
        onChange={handleChange}
      />
      {error && <div className="text-sm text-danger">{error}</div>}
      <Button type="submit" disabled={isLoading} fullWidth>
        {isLoading ? 'Verifying...' : 'Sign Up as Doctor'}
      </Button>
    </form>
  )
}