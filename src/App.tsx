import {
  CalendarDays,
  Clock3,
  Heart,
  MapPin,
  Music2,
  Navigation,
  VolumeX,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'


const weddingDate = new Date('2026-08-20T17:00:00+01:00').getTime()
const initialCountdown: Countdown = { days: 0, hours: 0, minutes: 0, seconds: 0 }

type Countdown = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calculateCountdown(): Countdown {
  const distance = Math.max(weddingDate - Date.now(), 0)

  return {
    days: Math.floor(distance / 86_400_000),
    hours: Math.floor((distance / 3_600_000) % 24),
    minutes: Math.floor((distance / 60_000) % 60),
    seconds: Math.floor((distance / 1_000) % 60),
  }
}

export default function App() {
  const [countdown, setCountdown] = useState<Countdown>(initialCountdown)
  const [musicPlaying, setMusicPlaying] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const musicTimerRef = useRef<number | null>(null)

  useEffect(() => {
    setCountdown(calculateCountdown())
    const timer = window.setInterval(() => setCountdown(calculateCountdown()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const revealElements = document.querySelectorAll<HTMLElement>('[data-reveal]')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.14 },
    )

    revealElements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    return () => {
      if (musicTimerRef.current) window.clearInterval(musicTimerRef.current)
      void audioContextRef.current?.close()
    }
  }, [])

  const playNote = (context: AudioContext, frequency: number, delay: number) => {
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const start = context.currentTime + delay

    oscillator.type = 'sine'
    oscillator.frequency.value = frequency
    gain.gain.setValueAtTime(0, start)
    gain.gain.linearRampToValueAtTime(0.035, start + 0.18)
    gain.gain.exponentialRampToValueAtTime(0.001, start + 2.8)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(start)
    oscillator.stop(start + 3)
  }

  const playMusicPhrase = (context: AudioContext) => {
    const phrase = [523.25, 659.25, 783.99, 659.25]
    phrase.forEach((frequency, index) => {
      playNote(context, frequency, index * 1.45)
    })
  }

  const toggleMusic = async () => {
    if (musicPlaying) {
      if (musicTimerRef.current) window.clearInterval(musicTimerRef.current)
      musicTimerRef.current = null
      await audioContextRef.current?.suspend()
      setMusicPlaying(false)
      return
    }

    const AudioContextClass = window.AudioContext
    const context = audioContextRef.current ?? new AudioContextClass()
    audioContextRef.current = context
    await context.resume()
    playMusicPhrase(context)
    musicTimerRef.current = window.setInterval(() => playMusicPhrase(context), 6_200)
    setMusicPlaying(true)
  }

  const countdownItems = [
    { label: 'يوم', value: countdown.days },
    { label: 'ساعة', value: countdown.hours },
    { label: 'دقيقة', value: countdown.minutes },
    { label: 'ثانية', value: countdown.seconds },
  ]

  return (
    <main dir="rtl" className="wedding-page">
      <button
        className={`music-toggle ${musicPlaying ? 'is-playing' : ''}`}
        type="button"
        onClick={toggleMusic}
        aria-label={musicPlaying ? 'إيقاف الموسيقى' : 'تشغيل الموسيقى'}
      >
        {musicPlaying ? <Music2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
        <span>{musicPlaying ? 'الموسيقى تعمل' : 'تشغيل الموسيقى'}</span>
      </button>

      <section className="hero" aria-labelledby="couple-names">
        <div className="grain" aria-hidden="true" />
        <FloralCorner className="floral-corner floral-top" />
        <FloralCorner className="floral-corner floral-bottom" />
        <div className="hero-frame" aria-hidden="true" />

        <div className="hero-content">
          <p className="eyebrow hero-reveal delay-one">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
          <div className="royal-mark hero-reveal delay-two" aria-hidden="true">
            <span />
            <Heart fill="currentColor" />
            <span />
          </div>
          <p className="occasion hero-reveal delay-two">حفل زفاف</p>
          <h1 id="couple-names" className="couple-names hero-reveal delay-three">
            <span>حكيم</span>
            <b>و</b>
            <span>آية</span>
          </h1>
          <p className="invitation-copy hero-reveal delay-four">
            بكل الحب والفرح، نتشرّف بدعوتكم لمشاركتنا أجمل لحظات العمر
            والاحتفال معنا ببداية حكايتنا.
          </p>
          <a className="scroll-cue hero-reveal delay-five" href="#countdown">
            <span>تفاصيل الحفل</span>
            <i aria-hidden="true" />
          </a>
        </div>
      </section>

      <section id="countdown" className="section countdown-section">
        <div className="section-inner" data-reveal>
          <p className="eyebrow">موعدنا يقترب</p>
          <h2>نعدّ الأيام للقائكم</h2>
          <Ornament />
          <div className="countdown-grid" aria-label="الوقت المتبقي حتى حفل الزفاف">
            {countdownItems.map((item) => (
              <div className="countdown-card" key={item.label}>
                <span className="latin-number">{String(item.value).padStart(2, '0')}</span>
                <small>{item.label}</small>
              </div>
            ))}
          </div>
          <p className="date-line latin-number">20 · 08 · 2026</p>
        </div>
      </section>

      <section className="section details-section">
        <div className="details-art" data-reveal>
          <div className="arch-art">
            <BotanicalIllustration />
            <span className="art-monogram">ع &amp; آ</span>
          </div>
        </div>
        <div className="details-copy" data-reveal>
          <p className="eyebrow">ليلة العمر</p>
          <h2>يسرّنا حضوركم</h2>
          <p className="lead">
            حضوركم يكمّل فرحتنا ويمنح ليلتنا معنى أجمل. ننتظركم لنصنع معًا
            ذكرى تبقى في القلب.
          </p>
          <div className="event-facts">
            <article>
              <CalendarDays aria-hidden="true" />
              <div>
                <span>الخميس</span>
                <strong className="latin-number">20 / 08 / 2026</strong>
              </div>
            </article>
            <article>
              <Clock3 aria-hidden="true" />
              <div>
                <span>يفتح الاستقبال أبوابه</span>
                <strong className="latin-number">17:00</strong>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section venue-section">
        <div className="venue-heading" data-reveal>
          <p className="eyebrow">مكان اللقاء</p>
          <h2>قاعة البهجة 1</h2>
          <p><MapPin aria-hidden="true" /> مدينة فاس، المغرب</p>
        </div>
        <div className="map-shell" data-reveal>
          <iframe
            title="خريطة موقع قاعة البهجة 1"
            src="https://www.google.com/maps?q=34.0261934,-4.9971495&z=16&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="map-card">
            <span className="map-pin"><MapPin aria-hidden="true" /></span>
            <div>
              <small>وجهتكم</small>
              <strong>قاعة البهجة 1</strong>
              <p>نتمنّى لكم وصولًا سهلًا وآمنًا</p>
            </div>
            <a
              href="https://maps.app.goo.gl/KEiXk8vY3YaryZvK6"
              target="_blank"
              rel="noreferrer"
            >
              <Navigation aria-hidden="true" />
              الحصول على الاتجاهات
            </a>
          </div>
        </div>
      </section>

      <section className="closing-section">
        <Ornament />
        <p className="eyebrow" data-reveal>بوجودكم تكتمل فرحتنا</p>
        <h2 data-reveal>شكرًا لأنكم جزء من حكايتنا</h2>
        <p className="closing-copy" data-reveal>
          نترقّب لقاءكم بقلوب مغمورة بالمحبة، ونرجو أن تبقى هذه الليلة ذكرى
          جميلة تجمعنا بكم دائمًا.
        </p>
        <p className="closing-names" data-reveal>
          حكيم <Heart fill="currentColor" aria-hidden="true" /> آية
        </p>
        <footer>
          <span className="latin-number">20 · 08 · 2026</span>
          <span>صُنعت بمحبة ليومنا المميّز</span>
        </footer>
      </section>
    </main>
  )
}

function Ornament() {
  return (
    <div className="ornament" aria-hidden="true">
      <span />
      <svg viewBox="0 0 48 22">
        <path d="M24 20C19 12 12 9 3 10c8-2 13-5 16-9 1 7 3 11 5 13 2-2 4-6 5-13 3 4 8 7 16 9-9-1-16 2-21 10Z" />
      </svg>
      <span />
    </div>
  )
}

function FloralCorner({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 320 340" aria-hidden="true">
      <path className="stem" d="M15 325C87 261 105 187 94 102 88 57 119 30 170 12" />
      <path className="stem thin" d="M72 266c51-19 91-51 117-99 19-35 48-52 91-51" />
      <path className="leaf" d="M93 216c-44-2-67-19-72-52 35-4 61 13 72 52Z" />
      <path className="leaf" d="M102 166c39-15 67-9 84 18-30 21-58 15-84-18Z" />
      <path className="leaf" d="M98 106c-30-16-42-39-34-68 31 8 44 31 34 68Z" />
      <path className="leaf" d="M160 184c8-37 29-57 63-59 1 35-20 55-63 59Z" />
      <path className="leaf" d="M190 138c6-29 23-45 50-47 1 27-16 43-50 47Z" />
      <circle className="flower" cx="169" cy="17" r="11" />
      <circle className="flower-soft" cx="174" cy="20" r="23" />
      <circle className="berry" cx="282" cy="117" r="7" />
      <circle className="berry" cx="266" cy="111" r="4" />
    </svg>
  )
}

function BotanicalIllustration() {
  return (
    <svg className="botanical-art" viewBox="0 0 420 560" aria-hidden="true">
      <path d="M86 538c20-95 69-176 147-242 64-54 100-130 107-229" />
      <path d="M124 455c73-31 123-79 151-145" />
      <path d="M180 363c-63 2-101-22-114-72 58-7 96 17 114 72Z" />
      <path d="M238 295c52-25 93-21 122 13-38 38-79 34-122-13Z" />
      <path d="M295 206c-46-24-64-59-52-104 48 13 65 48 52 104Z" />
      <path d="M115 455c-44-4-70-25-77-62 39-5 65 16 77 62Z" />
      <path d="M305 143c10-51 40-80 88-86 4 49-25 78-88 86Z" />
      <circle cx="343" cy="58" r="17" />
      <circle cx="347" cy="61" r="35" className="soft-bloom" />
    </svg>
  )
}
