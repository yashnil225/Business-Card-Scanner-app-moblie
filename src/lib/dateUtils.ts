import type { Contact } from '@/src/types/contact'

export function isToday(timestamp: number): boolean {
    const date = new Date(timestamp)
    const today = new Date()
    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    )
}

export function isThisWeek(timestamp: number): boolean {
    const date = new Date(timestamp)
    const today = new Date()
    const diffTime = today.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays < 7 && !isToday(timestamp)
}

export function isThisMonth(timestamp: number): boolean {
    const date = new Date(timestamp)
    const today = new Date()
    const diffTime = today.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays < 30
}

export function getContactsThisWeek(contacts: Contact[]): Contact[] {
    return contacts.filter((contact) => {
        const diffTime = Date.now() - contact.createdAt
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        return diffDays < 7
    })
}

export function getContactsThisMonth(contacts: Contact[]): Contact[] {
    return contacts.filter((contact) => {
        const diffTime = Date.now() - contact.createdAt
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        return diffDays < 30
    })
}

export function groupContactsByDate(contacts: Contact[]): {
    today: Contact[]
    thisWeek: Contact[]
    earlier: Contact[]
} {
    const today: Contact[] = []
    const thisWeek: Contact[] = []
    const earlier: Contact[] = []

    contacts.forEach((contact) => {
        if (isToday(contact.createdAt)) {
            today.push(contact)
        } else if (isThisWeek(contact.createdAt)) {
            thisWeek.push(contact)
        } else {
            earlier.push(contact)
        }
    })

    return { today, thisWeek, earlier }
}

export function formatDateLabel(timestamp: number): string {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (isToday(timestamp)) {
        return 'Today'
    } else if (
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear()
    ) {
        return 'Yesterday'
    } else {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        })
    }
}

export function formatScanDate(timestamp: number): string {
    const date = new Date(timestamp)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
        if (diffHours === 0) {
            const diffMinutes = Math.floor(diffTime / (1000 * 60))
            return diffMinutes < 1 ? 'Just now' : `${diffMinutes}m ago`
        }
        return `${diffHours}h ago`
    } else if (diffDays === 1) {
        return 'Yesterday'
    } else if (diffDays < 7) {
        return `${diffDays}d ago`
    } else {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        })
    }
}
