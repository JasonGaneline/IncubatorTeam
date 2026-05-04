import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext.jsx'
import { Button } from '../common/ui/Button.jsx'
import { TextField } from '../common/ui/TextField.jsx'
import { updateMe, verifyDoctor } from '../utils/authApi.js'

/**
 * OnboardingPage walks a logged-in user (typically a brand-new Google sign-in)
 * through choosing an account type and persists the result.
 *
 * The five paths:
 *   - pregnant_woman        -> collects pregnancy_week, then PUT /users/me
 *   - spouse_of_pregnant_woman, soon_to_be_pregnant, information_only
 *                           -> PUT /users/me with the chosen role
 *   - verified_professional -> collects first/last name + NPI, then
 *                              POST /auth/verify-doctor (NPPES verification)
 *
 * On success the user lands on /check-in (default landing).
 */

const ROLE_OPTIONS = [
  {
    id: 'pregnant_woman',
    label: 'Pregnant woman',
    desc: 'I am currently pregnant.',
  },
  {
    id: 'spouse_of_pregnant_woman',
    label: 'Spouse of a pregnant woman',
    desc: 'I am supporting a pregnant partner.',
  },
  {
    id: 'soon_to_be_pregnant',
    label: 'Soon-to-be pregnant woman',
    desc: 'I am planning for pregnancy.',
  },
  {
    id: 'information_only',
    label: 'Information-only user',
    desc: 'I am here to learn.',
  },
  {
    id: 'verified_professional',
    label: 'Join as a Professional (Doctor)',
    desc: 'Verify with your NPI to get a verified badge.',
  },
]

export function OnboardingPage() {
  const navigate = useNavigate()
  const { setAuthUser } = useAuth()
  const [step, setStep] = useState('role-select')
  const [accountType, setAccountType] = useState(null)
  const [pregnancyWeek, setPregnancyWeek] = useState('')
  const [doctorForm, setDoctorForm] = useState({
    first_name: '',
    last_name: '',
    npi_number: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleRoleSelect = (role) => {
    setAccountType(role)
    setError('')
    if (role === 'pregnant_woman') {
      setStep('pregnancy-week')
      return
    }
    if (role === 'verified_professional') {
      setStep('professional')
      return
    }
    completeBasicRole(role, null)
  }

  const completeBasicRole = async (role, week) => {
    setIsLoading(true)
    setError('')
    try {
      const payload =
        role === 'pregnant_woman'
          ? { user_role: role, pregnancy_week: week }
          : { user_role: role }
      const updatedUser = await updateMe(payload)
      setAuthUser(updatedUser)
      navigate('/check-in', { replace: true })
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePregnancySubmit = async () => {
    const weekNumber = Number(pregnancyWeek)
    if (
      pregnancyWeek === '' ||
      !Number.isInteger(weekNumber) ||
      weekNumber < 0 ||
      weekNumber > 42
    ) {
      setError('Please enter a whole number from 0 to 42.')
      return
    }
    await completeBasicRole('pregnant_woman', weekNumber)
  }

  const handleDoctorSubmit = async () => {
    const { first_name, last_name, npi_number } = doctorForm
    if (!first_name.trim() || !last_name.trim()) {
      setError('First and last name are required to verify your NPI.')
      return
    }
    if (!/^\d{10}$/.test(npi_number)) {
      setError('NPI must be exactly 10 digits.')
      return
    }
    setIsLoading(true)
    setError('')
    try {
      const updatedUser = await verifyDoctor({
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        npi_number,
      })
      setAuthUser(updatedUser)
      navigate('/check-in', { replace: true })
    } catch (err) {
      setError(err.message || 'NPI verification failed.')
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 'role-select') {
    return (
      <div className="min-h-svh bg-background pb-24 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome</h1>
            <p className="mt-2 text-sm text-muted-foreground">Choose your account type</p>
          </div>
          <div className="space-y-3">
            {ROLE_OPTIONS.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => handleRoleSelect(type.id)}
                disabled={isLoading}
                className="w-full p-4 border border-border rounded-lg text-left hover:bg-muted transition disabled:opacity-60"
              >
                <p className="font-semibold text-foreground">{type.label}</p>
                <p className="text-xs text-muted-foreground">{type.desc}</p>
              </button>
            ))}
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
        </div>
      </div>
    )
  }

  if (step === 'pregnancy-week') {
    return (
      <div className="min-h-svh bg-background pb-24 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <h1 className="text-2xl font-bold text-foreground">What week are you?</h1>
          <p className="text-sm text-muted-foreground">
            We use this to personalize your check-in tips and progress tracker.
          </p>
          <TextField
            type="number"
            min="0"
            max="42"
            value={pregnancyWeek}
            onChange={(e) => setPregnancyWeek(e.target.value)}
            placeholder="Enter week (0-42)"
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setError('')
                setStep('role-select')
              }}
              disabled={isLoading}
            >
              Back
            </Button>
            <Button onClick={handlePregnancySubmit} disabled={isLoading} fullWidth>
              {isLoading ? 'Saving...' : 'Continue'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'professional') {
    return (
      <div className="min-h-svh bg-background pb-24 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <h1 className="text-2xl font-bold text-foreground">Verify your NPI</h1>
          <p className="text-sm text-muted-foreground">
            We verify your name and 10-digit NPI against the public NPPES NPI Registry.
            Once verified you receive a check-mark badge in the forum.
          </p>
          <TextField
            label="First name"
            value={doctorForm.first_name}
            onChange={(e) => setDoctorForm((prev) => ({ ...prev, first_name: e.target.value }))}
            placeholder="As listed in NPPES"
          />
          <TextField
            label="Last name"
            value={doctorForm.last_name}
            onChange={(e) => setDoctorForm((prev) => ({ ...prev, last_name: e.target.value }))}
            placeholder="As listed in NPPES"
          />
          <TextField
            label="NPI number"
            value={doctorForm.npi_number}
            onChange={(e) =>
              setDoctorForm((prev) => ({
                ...prev,
                npi_number: e.target.value.replace(/\D/g, '').slice(0, 10),
              }))
            }
            placeholder="10-digit NPI"
            inputMode="numeric"
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setError('')
                setStep('role-select')
              }}
              disabled={isLoading}
            >
              Back
            </Button>
            <Button onClick={handleDoctorSubmit} disabled={isLoading} fullWidth>
              {isLoading ? 'Verifying...' : 'Verify and continue'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
