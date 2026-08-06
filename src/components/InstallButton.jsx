import { useEffect, useState } from 'react'
import { useLanguage } from '../context/LanguageContext.jsx'

function isRunningAsInstalledApp() {
    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true
    )
}

function isIOSDevice() {
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
}

export default function InstallButton() {
    const { lang } = useLanguage()

    const [installPrompt, setInstallPrompt] = useState(null)
    const [installed, setInstalled] = useState(
        isRunningAsInstalledApp,
    )

    const isIOS = isIOSDevice()

    useEffect(() => {
        const handleBeforeInstallPrompt = (event) => {
            // Browser-এর automatic prompt delay করে নিজের button ব্যবহার করছি।
            event.preventDefault()
            setInstallPrompt(event)
        }

        const handleAppInstalled = () => {
            setInstalled(true)
            setInstallPrompt(null)
        }

        window.addEventListener(
            'beforeinstallprompt',
            handleBeforeInstallPrompt,
        )

        window.addEventListener(
            'appinstalled',
            handleAppInstalled,
        )

        return () => {
            window.removeEventListener(
                'beforeinstallprompt',
                handleBeforeInstallPrompt,
            )

            window.removeEventListener(
                'appinstalled',
                handleAppInstalled,
            )
        }
    }, [])

    const handleInstall = async () => {
        // iOS সাধারণত beforeinstallprompt দেয় না।
        if (isIOS && !installPrompt) {
            window.alert(
                lang === 'bn'
                    ? 'iPhone/iPad-এ Share button চাপুন, তারপর “Add to Home Screen” নির্বাচন করুন।'
                    : 'On iPhone/iPad, tap Share and then select “Add to Home Screen”.',
            )

            return
        }

        if (!installPrompt) {
            return
        }

        try {
            await installPrompt.prompt()

            const choice = await installPrompt.userChoice

            if (choice.outcome === 'accepted') {
                setInstalled(true)
            }
        } catch (error) {
            console.error('PWA installation failed:', error)
        } finally {
            // একই prompt object দ্বিতীয়বার ব্যবহার করা যায় না।
            setInstallPrompt(null)
        }
    }

    // App already installed হলে button hide।
    if (installed) {
        return null
    }

    // Browser install event support না করলে Android/Desktop-এ hide।
    // iOS-এ manual installation instruction দেওয়ার জন্য visible থাকবে।
    if (!installPrompt && !isIOS) {
        return null
    }

    return (
        <button
            type="button"
            className="btn btn--ghost"
            onClick={handleInstall}
            data-track="Hero: Install PWA"
        >
            {lang === 'bn'
                ? 'ফোনে ইনস্টল করুন'
                : 'Install on phone'}
        </button>
    )
}