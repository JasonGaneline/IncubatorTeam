const PREGNANCY_DATA = {
  '1-5': {
    baby: 'Conception to blastocyst formation',
    mother: 'Possible implantation symptoms, fatigue, nausea may begin'
  },
  '5-10': {
    baby: 'Heart begins beating, limbs forming',
    mother: 'Morning sickness peaks, breast tenderness, increased urination'
  },
  '10-15': {
    baby: 'Fingers and toes visible, face forming',
    mother: 'Nausea may decrease, energy may increase, skin changes'
  },
  '15-20': {
    baby: 'Fetal movements felt, organs developing',
    mother: 'Quickening sensations, weight gain acceleration, lower back pain'
  },
  '20-25': {
    baby: 'Eyebrows, eyelashes, hearing improving',
    mother: 'Baby bump more visible, possible stretch marks, Braxton Hicks begin'
  },
  '25-30': {
    baby: 'Rapid brain development, viable if born now',
    mother: 'Increased swelling, possible gestational diabetes screening'
  },
  '30-35': {
    baby: 'Lungs maturing, baby dropping into pelvis',
    mother: 'Shortness of breath, sleeping difficulties, frequent urination'
  },
  '35-40': {
    baby: 'Final weight gain, ready for birth',
    mother: 'Pelvic pressure, possible loss of mucus plug, pre-labor symptoms'
  },
}

export function PregnancyProgressTracker({ pregnancyWeek }) {
  const w = Number(pregnancyWeek)
  if (Number.isNaN(w) || w < 0 || w > 42) {
    return (
      <div className="text-sm text-muted-foreground">
        Set a pregnancy week between 0 and 42 in settings or onboarding to see progress.
      </div>
    )
  }

  // Week 0 maps into the earliest developmental bucket for copy.
  const weekForRange = w === 0 ? 1 : w

  let rangeKey
  if (weekForRange <= 5) rangeKey = '1-5'
  else if (weekForRange <= 10) rangeKey = '5-10'
  else if (weekForRange <= 15) rangeKey = '10-15'
  else if (weekForRange <= 20) rangeKey = '15-20'
  else if (weekForRange <= 25) rangeKey = '20-25'
  else if (weekForRange <= 30) rangeKey = '25-30'
  else if (weekForRange <= 35) rangeKey = '30-35'
  else rangeKey = '35-40'

  const data = PREGNANCY_DATA[rangeKey]

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Current week: {w}</p>
      <div>
        <h3 className="text-sm font-semibold text-foreground">Baby Development</h3>
        <p className="mt-1 text-sm text-muted-foreground">{data.baby}</p>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">Your Body</h3>
        <p className="mt-1 text-sm text-muted-foreground">{data.mother}</p>
      </div>
    </div>
  )
}