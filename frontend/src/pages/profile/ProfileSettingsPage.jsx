import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { useProfileData } from '../../hooks/useProfileData.js'
import { Button } from '../../common/ui/Button.jsx'
import { TextField } from '../../common/ui/TextField.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { updateMe } from '../../utils/authApi.js'
import { fileToProfilePictureDataUrl } from '../../utils/imageUpload.js'

export function ProfileSettingsPage() {
  const navigate = useNavigate()
  const { authUser, setAuthUser } = useAuth()
  const { data, refetch } = useProfileData()
  const isPregnantWoman = authUser?.user_role === 'pregnant_woman'

  const galleryInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    age: '',
    profile_picture: '',
    pregnancy_week: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [photoBusy, setPhotoBusy] = useState(false)

  useEffect(() => {
    if (data?.user) {
      setFormData({
        display_name: data.user.display_name || '',
        bio: data.user.bio || '',
        age: data.user.age ?? '',
        profile_picture: data.user.profile_picture || '',
        pregnancy_week: data.user.pregnancy_week ?? '',
      })
    }
  }, [data])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageFile = async (file) => {
    if (!file) return
    setPhotoBusy(true)
    setError('')
    try {
      const dataUrl = await fileToProfilePictureDataUrl(file)
      setFormData((prev) => ({ ...prev, profile_picture: dataUrl }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not use this image.')
    } finally {
      setPhotoBusy(false)
      if (galleryInputRef.current) galleryInputRef.current.value = ''
      if (cameraInputRef.current) cameraInputRef.current.value = ''
    }
  }

  const clearPhoto = () => {
    setFormData((prev) => ({ ...prev, profile_picture: '' }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Pregnancy week is mandatory only for the pregnant_woman role.
    if (isPregnantWoman) {
      const weekNumber = Number(formData.pregnancy_week)
      if (
        formData.pregnancy_week === '' ||
        !Number.isInteger(weekNumber) ||
        weekNumber < 0 ||
        weekNumber > 42
      ) {
        setError('Pregnancy week is required and must be a whole number from 0 to 42.')
        return
      }
    }

    setIsLoading(true)
    try {
      const payload = {
        display_name: formData.display_name || null,
        bio: formData.bio || null,
        age: formData.age === '' ? null : parseInt(formData.age, 10),
        profile_picture: formData.profile_picture || null,
        pregnancy_week: isPregnantWoman
          ? parseInt(formData.pregnancy_week, 10)
          : formData.pregnancy_week === ''
            ? null
            : parseInt(formData.pregnancy_week, 10),
      }

      const updatedUser = await updateMe(payload)
      setAuthUser(updatedUser)
      await refetch()
      navigate('/profile')
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-svh bg-background pb-24">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Profile Settings</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            id="display_name"
            label="Display Name"
            value={formData.display_name}
            onChange={(e) => handleChange({ target: { name: 'display_name', value: e.target.value } })}
          />
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-foreground mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              maxLength={500}
              rows={3}
              placeholder="Tell others about yourself"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
            />
          </div>
          <TextField
            id="age"
            label="Age"
            type="number"
            value={formData.age}
            onChange={(e) => handleChange({ target: { name: 'age', value: e.target.value } })}
          />

          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-sm font-medium text-foreground mb-2">Profile photo</p>
            <p className="text-xs text-muted-foreground mb-3">
              Upload from your device or camera roll. On phones you can use your camera or photo
              library.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              {formData.profile_picture ? (
                <img
                  src={formData.profile_picture}
                  alt="Profile preview"
                  className="h-24 w-24 shrink-0 rounded-full object-cover ring-2 ring-border"
                />
              ) : (
                <div
                  className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-border bg-background text-xs text-muted-foreground"
                  aria-hidden
                >
                  No photo
                </div>
              )}
              <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth={false}
                  disabled={photoBusy}
                  onClick={() => galleryInputRef.current?.click()}
                >
                  {photoBusy ? 'Working…' : 'Choose file'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  fullWidth={false}
                  disabled={photoBusy}
                  onClick={() => cameraInputRef.current?.click()}
                >
                  Use camera
                </Button>
                {formData.profile_picture ? (
                  <Button type="button" variant="outline" fullWidth={false} onClick={clearPhoto}>
                    Remove photo
                  </Button>
                ) : null}
              </div>
            </div>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              aria-hidden
              tabIndex={-1}
              onChange={(e) => void handleImageFile(e.target.files?.[0])}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="user"
              className="sr-only"
              aria-hidden
              tabIndex={-1}
              onChange={(e) => void handleImageFile(e.target.files?.[0])}
            />
          </div>

          {isPregnantWoman && (
            <TextField
              id="pregnancy_week"
              label="Pregnancy Week (required)"
              type="number"
              value={formData.pregnancy_week}
              onChange={(e) =>
                handleChange({ target: { name: 'pregnancy_week', value: e.target.value } })
              }
            />
          )}

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading} fullWidth>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/profile')}
              fullWidth
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
