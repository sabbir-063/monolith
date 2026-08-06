import { useRegisterSW } from 'virtual:pwa-register/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext.jsx'

export default function ReloadPrompt() {
  const { lang } = useLanguage()
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered')
    },
    onRegisterError(error) {
      console.log('SW registration error', error)
    },
  })

  const close = () => {
    setNeedRefresh(false)
  }

  return (
    <AnimatePresence>
      {needRefresh && (
        <motion.div
          className="toast"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.3 }}
          style={{ 
            bottom: '5rem', 
            flexDirection: 'column', 
            alignItems: 'flex-start',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6em' }}>
            <span aria-hidden="true" style={{ color: 'var(--kiln)' }}>●</span>
            <span>
              {lang === 'bn' ? 'নতুন আপডেট এসেছে।' : 'New update available.'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'flex-end' }}>
            <button 
              className="btn btn--primary" 
              style={{ padding: '0.5em 1em', fontSize: '0.75rem' }} 
              onClick={() => updateServiceWorker(true)}
            >
              {lang === 'bn' ? 'রিলোড করুন' : 'Reload'}
            </button>
            <button 
              className="btn btn--ghost" 
              style={{ 
                padding: '0.5em 1em', 
                fontSize: '0.75rem', 
                color: 'var(--clay-900)', 
                borderColor: 'var(--clay-900)' 
              }} 
              onClick={() => close()}
            >
              {lang === 'bn' ? 'পরে' : 'Later'}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}


