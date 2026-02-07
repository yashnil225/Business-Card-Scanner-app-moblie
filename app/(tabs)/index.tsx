import { ScreenErrorBoundary } from '@/src/components/error'
import { StatsCard } from '@/src/components/StatsCard'
import { Text } from '@/src/components/ui'
import { CompetitorIntelligence } from '@/src/components/ui/CompetitorIntelligence'
import { NetworkValueScore } from '@/src/components/ui/NetworkValueScore'
import { QualityReportCard } from '@/src/components/ui/QualityReportCard'
import { TagList } from '@/src/components/ui/TagList'
import { useColors } from '@/src/hooks/useColors'
import {
    getContactsThisMonth,
    getContactsThisWeek,
} from '@/src/lib/dateUtils'
import {
    getCompanyColor,
    getIndustryStats,
    getInitials,
    getTopCompanies,
} from '@/src/lib/companyUtils'
import {
    getCompanySizeBreakdown as getSizeBreakdown,
    getGeographicDistribution,
    getIndustryBreakdown as getIndustryData,
    getNetworkMetrics,
    getQualityReport,
    getTopCompanies as getTopCompaniesData,
    getWeeklyTrends,
} from '@/src/lib/analytics'
import { calculateNetworkValueScore } from '@/src/stores/gamificationStore'
import { borderRadius, fontSize, spacing, type Colors } from '@/src/lib/theme'
import { useContactsStore } from '@/src/stores/contactsStore'
import { useGamificationStore } from '@/src/stores/gamificationStore'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useEffect, useMemo } from 'react'
import {
    Dimensions,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native'
import { BarChart, LineChart, PieChart } from 'react-native-gifted-charts'

const { width: screenWidth } = Dimensions.get('window')

const createStyles = (colors: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        scrollContent: {
            paddingBottom: spacing.xl * 3,
        },
        header: {
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.xl + 20,
            paddingBottom: spacing.md,
        },
        greeting: {
            fontSize: fontSize.lg,
            color: colors.secondary,
            fontWeight: '500',
        },
        username: {
            fontSize: fontSize['3xl'],
            fontWeight: '700',
            color: colors.text,
            marginTop: spacing.xs,
        },
        statsContainer: {
            flexDirection: 'row',
            gap: spacing.md,
            paddingHorizontal: spacing.lg,
            marginBottom: spacing.lg,
        },
        statsRow: {
            flexDirection: 'row',
            gap: spacing.md,
        },
        section: {
            marginTop: spacing.xl,
            paddingHorizontal: spacing.lg,
        },
        sectionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.md,
        },
        sectionTitle: {
            fontSize: fontSize.xl,
            fontWeight: '700',
            color: colors.text,
        },
        sectionSubtitle: {
            fontSize: fontSize.sm,
            color: colors.secondary,
        },
        chartContainer: {
            backgroundColor: colors.surface,
            borderRadius: borderRadius.md,
            padding: spacing.md,
            borderWidth: 1,
            borderColor: colors.border,
        },
        companiesGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing.md,
        },
        companyBadge: {
            alignItems: 'center',
            width: 70,
        },
        companyAvatar: {
            width: 56,
            height: 56,
            borderRadius: borderRadius.md,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: spacing.xs,
        },
        companyInitials: {
            fontSize: fontSize.xl,
            fontWeight: '700',
            color: '#fff',
        },
        companyName: {
            fontSize: fontSize.xs,
            color: colors.secondary,
            textAlign: 'center',
        },
        topCompaniesList: {
            backgroundColor: colors.surface,
            borderRadius: borderRadius.md,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden',
        },
        topCompanyItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        topCompanyRank: {
            width: 28,
            height: 28,
            borderRadius: borderRadius.full,
            backgroundColor: colors.accent,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: spacing.md,
        },
        topCompanyRankText: {
            fontSize: fontSize.sm,
            fontWeight: '700',
            color: '#fff',
        },
        topCompanyInfo: {
            flex: 1,
        },
        topCompanyName: {
            fontSize: fontSize.base,
            fontWeight: '600',
            color: colors.text,
        },
        topCompanyCount: {
            fontSize: fontSize.sm,
            color: colors.secondary,
        },
        industryItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: spacing.sm,
        },
        industryBar: {
            height: 8,
            borderRadius: borderRadius.full,
            marginTop: spacing.xs,
        },
        industryLabel: {
            fontSize: fontSize.sm,
            color: colors.text,
            flex: 1,
        },
        industryCount: {
            fontSize: fontSize.sm,
            color: colors.secondary,
            fontWeight: '600',
        },
        recentActivityItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        recentActivityImage: {
            width: 48,
            height: 48,
            borderRadius: borderRadius.sm,
            marginRight: spacing.md,
        },
        recentActivityInfo: {
            flex: 1,
        },
        recentActivityName: {
            fontSize: fontSize.base,
            fontWeight: '600',
            color: colors.text,
        },
        recentActivityCompany: {
            fontSize: fontSize.sm,
            color: colors.secondary,
        },
        recentActivityTime: {
            fontSize: fontSize.xs,
            color: colors.tertiary,
        },
        fab: {
            position: 'absolute',
            bottom: 30,
            right: 30,
            width: 64,
            height: 64,
            borderRadius: 32,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.xl * 4,
        },
        emptyTitle: {
            fontSize: fontSize.xl,
            fontWeight: '700',
            color: colors.text,
            marginTop: spacing.lg,
            marginBottom: spacing.sm,
        },
        emptySubtitle: {
            fontSize: fontSize.base,
            color: colors.secondary,
            textAlign: 'center',
            marginBottom: spacing.xl,
        },
        emptyButton: {
            flexDirection: 'row',
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.md,
            borderRadius: borderRadius.full,
            alignItems: 'center',
            gap: spacing.sm,
        },
        emptyButtonText: {
            color: '#fff',
            fontSize: fontSize.base,
            fontWeight: '600',
        },
        streakCard: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            padding: spacing.md,
            backgroundColor: colors.surface,
            borderRadius: borderRadius.md,
            borderWidth: 1,
            borderColor: colors.border,
        },
        streakIcon: {
            width: 48,
            height: 48,
            borderRadius: borderRadius.full,
            justifyContent: 'center',
            alignItems: 'center',
        },
        streakInfo: {
            flex: 1,
        },
        streakTitle: {
            fontSize: fontSize.base,
            fontWeight: '600',
            color: colors.text,
        },
        streakValue: {
            fontSize: fontSize.sm,
            color: colors.secondary,
        },
        streakFlame: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 2,
        },
        weeklyChallengeCard: {
            backgroundColor: colors.surface,
            borderRadius: borderRadius.md,
            padding: spacing.md,
            borderWidth: 1,
            borderColor: colors.border,
        },
        challengeRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: spacing.sm,
        },
        challengeTitle: {
            fontSize: fontSize.base,
            fontWeight: '600',
            color: colors.text,
        },
        challengeProgress: {
            fontSize: fontSize.sm,
            color: colors.secondary,
        },
        progressBar: {
            height: 8,
            backgroundColor: colors.border,
            borderRadius: borderRadius.full,
            overflow: 'hidden',
        },
        progressFill: {
            height: '100%',
            backgroundColor: colors.accent,
            borderRadius: borderRadius.full,
        },
        geoItem: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: spacing.sm,
        },
        geoLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
        },
        geoIcon: {
            width: 32,
            height: 32,
            borderRadius: borderRadius.full,
            backgroundColor: colors.accent + '20',
            justifyContent: 'center',
            alignItems: 'center',
        },
        companySizeItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: spacing.sm,
        },
        companySizeLabel: {
            flex: 1,
            fontSize: fontSize.sm,
            color: colors.text,
        },
        companySizeBar: {
            height: 8,
            borderRadius: borderRadius.full,
            marginHorizontal: spacing.md,
            backgroundColor: colors.border,
        },
        companySizeCount: {
            fontSize: fontSize.sm,
            fontWeight: '600',
            color: colors.text,
            width: 40,
            textAlign: 'right',
        },
    })

function DashboardScreen() {
    const colors = useColors()
    const styles = useMemo(() => createStyles(colors), [colors])
    const router = useRouter()
    const contacts = useContactsStore((state) => state.contacts)
    const gamification = useGamificationStore()

    useEffect(() => {
        gamification.refreshWeeklyChallenges()
    }, [])

    const totalContacts = contacts.length
    const thisWeekCount = useMemo(() => getContactsThisWeek(contacts).length, [contacts])
    const thisMonthCount = useMemo(() => getContactsThisMonth(contacts).length, [contacts])

    const metrics = useMemo(() => getNetworkMetrics(contacts), [contacts])
    const weeklyTrends = useMemo(() => getWeeklyTrends(contacts), [contacts])
    const industryData = useMemo(() => getIndustryData(contacts), [contacts])
    const companySizeData = useMemo(() => getSizeBreakdown(contacts), [contacts])
    const geoData = useMemo(() => getGeographicDistribution(contacts), [contacts])
    const qualityReport = useMemo(() => getQualityReport(contacts), [contacts])
    const topCompanies = useMemo(() => getTopCompaniesData(contacts, 10), [contacts])

    const networkValue = useMemo(() => calculateNetworkValueScore(contacts), [contacts])

    const competitorContacts = useMemo(() => {
        return contacts.filter(c => c.isCompetitor)
    }, [contacts])

    const competitorCompanies = useMemo(() => {
        const companyMap = new Map<string, { count: number; industry?: string }>()
        competitorContacts.forEach(c => {
            if (c.company) {
                const existing = companyMap.get(c.company) || { count: 0 }
                companyMap.set(c.company, {
                    count: existing.count + 1,
                    industry: c.industry,
                })
            }
        })
        return Array.from(companyMap.entries())
            .map(([company, data]) => ({ company, ...data }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
    }, [competitorContacts])

    const weeklyData = useMemo(() => {
        return weeklyTrends.map(day => ({
            value: day.count,
            label: day.day,
            frontColor: day.count > 0 ? colors.accent : colors.border,
        }))
    }, [weeklyTrends, colors])

    const networkGrowthData = useMemo(() => {
        if (contacts.length === 0) return []
        const sortedContacts = [...contacts].sort((a, b) => (a.scanTimestamp || a.createdAt) - (b.scanTimestamp || b.createdAt))
        const data = []
        let cumulative = 0
        const step = Math.max(1, Math.floor(sortedContacts.length / 7))
        for (let i = 0; i < sortedContacts.length; i += step) {
            cumulative++
            data.push({ value: cumulative })
        }
        if (data.length === 0 || data[data.length - 1].value !== contacts.length) {
            data.push({ value: contacts.length })
        }
        return data
    }, [contacts])

    const industryPieData = useMemo(() => {
        const colors_pie = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#E91E63', '#607D8B', '#795548', '#009688']
        return industryData.slice(0, 8).map((item, index) => ({
            value: item.count,
            color: colors_pie[index % colors_pie.length],
            name: item.name,
        }))
    }, [industryData])

    const recentActivity = useMemo(() => {
        return [...contacts]
            .sort((a, b) => (b.scanTimestamp || b.createdAt) - (a.scanTimestamp || a.createdAt))
            .slice(0, 5)
    }, [contacts])

    const handleScanCard = () => {
        router.push('/(scan)/camera')
    }

    const handleViewAllContacts = () => {
        router.push('/(tabs)/contacts')
    }

    const uniqueCompanies = useMemo(() => {
        const companies = new Set(contacts.map((c) => c.company).filter(Boolean))
        return Array.from(companies).slice(0, 8)
    }, [contacts])

    if (contacts.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.emptyContainer}>
                    <Ionicons name="analytics-outline" size={80} color={colors.border} />
                    <Text style={styles.emptyTitle}>No Data Yet</Text>
                    <Text style={styles.emptySubtitle}>
                        Start scanning business cards to see your dashboard and insights
                    </Text>
                    <Pressable
                        style={[styles.emptyButton, { backgroundColor: colors.accent }]}
                        onPress={handleScanCard}
                    >
                        <Ionicons name="camera" size={20} color="#fff" />
                        <Text style={styles.emptyButtonText}>Scan First Card</Text>
                    </Pressable>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={styles.greeting}>Dashboard</Text>
                    <Text style={styles.username}>Analytics & Insights</Text>
                </View>

                <View style={styles.statsContainer}>
                    <StatsCard
                        title="Total"
                        value={totalContacts}
                        icon="people-outline"
                        backgroundColor="#E3F2FD"
                        iconColor="#1976D2"
                    />
                    <StatsCard
                        title="This Week"
                        value={thisWeekCount}
                        icon="calendar-outline"
                        backgroundColor="#E8F5E9"
                        iconColor="#388E3C"
                    />
                    <StatsCard
                        title="This Month"
                        value={thisMonthCount}
                        icon="trending-up-outline"
                        backgroundColor="#FFF3E0"
                        iconColor="#F57C00"
                    />
                </View>

                {gamification.currentStreak > 0 && (
                    <View style={[styles.section, styles.statsRow]}>
                        <View style={styles.streakCard}>
                            <View style={[styles.streakIcon, { backgroundColor: '#FF980020' }]}>
                                <Ionicons name="flame" size={24} color="#FF9800" />
                            </View>
                            <View style={styles.streakInfo}>
                                <Text style={styles.streakTitle}>{gamification.currentStreak} Day Streak!</Text>
                                <Text style={styles.streakValue}>Longest: {gamification.longestStreak} days</Text>
                            </View>
                            <View style={styles.streakFlame}>
                                {[...Array(Math.min(gamification.currentStreak, 7))].map((_, i) => (
                                    <Ionicons key={i} name="flame" size={12} color="#FF9800" />
                                ))}
                            </View>
                        </View>
                    </View>
                )}

                {metrics.networkValueScore > 0 && (
                    <View style={styles.section}>
                        <NetworkValueScore
                            score={metrics.networkValueScore}
                            totalContacts={metrics.totalContacts}
                            highPriorityCount={metrics.highPriorityCount}
                            averagePriority={metrics.averagePriorityScore}
                        />
                    </View>
                )}

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Weekly Trends</Text>
                        <Text style={styles.sectionSubtitle}>Last 7 days</Text>
                    </View>
                    <View style={styles.chartContainer}>
                        <BarChart
                            data={weeklyData}
                            width={screenWidth - spacing.lg * 4}
                            height={160}
                            barWidth={30}
                            spacing={14}
                            roundedTop
                            roundedBottom
                            hideRules
                            xAxisLabelTextStyle={{ color: colors.secondary, fontSize: 10 }}
                            yAxisTextStyle={{ color: colors.secondary, fontSize: 10 }}
                            noOfSections={4}
                            maxValue={Math.max(1, ...weeklyData.map((d) => d.value))}
                        />
                    </View>
                </View>

                {networkGrowthData.length > 1 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Network Growth</Text>
                            <Text style={styles.sectionSubtitle}>Cumulative contacts</Text>
                        </View>
                        <View style={styles.chartContainer}>
                            <LineChart
                                data={networkGrowthData}
                                width={screenWidth - spacing.lg * 4}
                                height={120}
                                spacing={40}
                                color={colors.accent}
                                thickness={3}
                                hideDataPoints
                                hideRules
                                curved
                                yAxisTextStyle={{ color: colors.secondary, fontSize: 10 }}
                            />
                        </View>
                    </View>
                )}

                {industryData.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Industry Distribution</Text>
                            <Text style={styles.sectionSubtitle}>{industryData.length} industries</Text>
                        </View>
                        <View style={styles.chartContainer}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <PieChart
                                    data={industryPieData}
                                    radius={80}
                                    innerRadius={50}
                                    centerLabelComponent={() => (
                                        <Text style={{ fontSize: fontSize.xl, fontWeight: '700', color: colors.text }}>
                                            {totalContacts}
                                        </Text>
                                    )}
                                />
                                <View style={{ flex: 1, paddingLeft: spacing.lg }}>
                                    {industryData.slice(0, 5).map((item, index) => {
                                        const pieColor = industryPieData[index]?.color || colors.border
                                        return (
                                            <View key={item.name} style={styles.industryItem}>
                                                <View style={[styles.industryBar, { width: `${item.percentage}%`, backgroundColor: pieColor }]} />
                                                <Text style={styles.industryCount}>{item.count}</Text>
                                            </View>
                                        )
                                    })}
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                {companySizeData.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Company Size Rankings</Text>
                            <Text style={styles.sectionSubtitle}>By company tier</Text>
                        </View>
                        <View style={styles.chartContainer}>
                            {companySizeData.map((item) => {
                                const maxCount = companySizeData[0]?.count || 1
                                const percentage = (item.count / maxCount) * 100
                                const sizeColors: Record<string, string> = {
                                    startup: '#607D8B',
                                    small: '#9E9E9E',
                                    medium: '#2196F3',
                                    large: '#4CAF50',
                                    enterprise: '#FF9800',
                                }
                                return (
                                    <View key={item.size} style={styles.companySizeItem}>
                                        <Text style={styles.companySizeLabel}>{item.label}</Text>
                                        <View style={[styles.companySizeBar, { width: `${percentage * 2}%`, backgroundColor: sizeColors[item.size] || colors.border }]} />
                                        <Text style={styles.companySizeCount}>{item.count}</Text>
                                    </View>
                                )
                            })}
                        </View>
                    </View>
                )}

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Networking Velocity</Text>
                        <Text style={styles.sectionSubtitle}>{metrics.networkingVelocity} contacts/week</Text>
                    </View>
                    <View style={styles.statsContainer}>
                        <StatsCard
                            title="Unique Industries"
                            value={metrics.uniqueIndustries}
                            icon="grid-outline"
                            backgroundColor="#E8EAF6"
                            iconColor="#5C6BC0"
                        />
                        <StatsCard
                            title="Unique Companies"
                            value={metrics.uniqueCompanies}
                            icon="business-outline"
                            backgroundColor="#E0F2F1"
                            iconColor="#009688"
                        />
                        <StatsCard
                            title="High Priority"
                            value={metrics.highPriorityCount}
                            icon="star-outline"
                            backgroundColor="#FFF8E1"
                            iconColor="#FFA000"
                        />
                    </View>
                </View>

                {geoData.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Geographic Distribution</Text>
                            <Text style={styles.sectionSubtitle}>{geoData.length} locations</Text>
                        </View>
                        <View style={styles.chartContainer}>
                            {geoData.slice(0, 5).map((item) => (
                                <View key={`${item.country}-${item.city}`} style={styles.geoItem}>
                                    <View style={styles.geoLeft}>
                                        <View style={styles.geoIcon}>
                                            <Ionicons name="location-outline" size={16} color={colors.accent} />
                                        </View>
                                        <Text style={{ color: colors.text }}>
                                            {item.city ? `${item.city}, ` : ''}{item.country}
                                        </Text>
                                    </View>
                                    <Text style={{ color: colors.secondary }}>{item.count}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {qualityReport.poor > 0 && (
                    <View style={styles.section}>
                        <QualityReportCard
                            excellent={qualityReport.excellent}
                            good={qualityReport.good}
                            poor={qualityReport.poor}
                            unknown={qualityReport.unknown}
                            onPoorQualityPress={() => router.push('/(tabs)/contacts')}
                        />
                    </View>
                )}

                {competitorCompanies.length > 0 && (
                    <View style={styles.section}>
                        <CompetitorIntelligence
                            competitors={competitorCompanies.map(c => ({
                                company: c.company,
                                count: c.count,
                                industry: c.industry,
                                contacts: competitorContacts.filter(contact => contact.company === c.company).map(c => ({ name: c.name, title: c.title, id: c.id }))
                            }))}
                            totalCompetitorCount={competitorContacts.length}
                            onCompanyPress={(company) => router.push(`/(tabs)/contacts?search=${company}`)}
                        />
                    </View>
                )}

                {uniqueCompanies.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Companies Discovered</Text>
                            <Text style={styles.sectionSubtitle}>{uniqueCompanies.length} unique</Text>
                        </View>
                        <View style={styles.companiesGrid}>
                            {uniqueCompanies.map((company) => (
                                <View key={company} style={styles.companyBadge}>
                                    <View
                                        style={[
                                            styles.companyAvatar,
                                            { backgroundColor: getCompanyColor(company || '') },
                                        ]}
                                    >
                                        <Text style={styles.companyInitials}>
                                            {getInitials(company || '')}
                                        </Text>
                                    </View>
                                    <Text style={styles.companyName} numberOfLines={1}>
                                        {company}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {topCompanies.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Top Companies</Text>
                            <Text style={styles.sectionSubtitle}>Most scanned</Text>
                        </View>
                        <View style={styles.topCompaniesList}>
                            {topCompanies.slice(0, 5).map((company, index) => (
                                <View key={company.name} style={styles.topCompanyItem}>
                                    <View style={styles.topCompanyRank}>
                                        <Text style={styles.topCompanyRankText}>{index + 1}</Text>
                                    </View>
                                    <View
                                        style={[
                                            styles.companyAvatar,
                                            {
                                                backgroundColor: getCompanyColor(company.name),
                                                width: 40,
                                                height: 40,
                                                marginRight: spacing.md,
                                            },
                                        ]}
                                    >
                                        <Text style={[styles.companyInitials, { fontSize: fontSize.base }]}>
                                            {getInitials(company.name)}
                                        </Text>
                                    </View>
                                    <View style={styles.topCompanyInfo}>
                                        <Text style={styles.topCompanyName}>{company.name}</Text>
                                        <Text style={styles.topCompanyCount}>
                                            {company.count} contact{company.count !== 1 ? 's' : ''}
                                            {company.industry && ` • ${company.industry}`}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {recentActivity.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Recent Activity</Text>
                            <Pressable onPress={handleViewAllContacts}>
                                <Text style={[styles.sectionSubtitle, { color: colors.accent }]}>
                                    View All
                                </Text>
                            </Pressable>
                        </View>
                        <View style={styles.chartContainer}>
                            {recentActivity.map((contact) => (
                                <Pressable
                                    key={contact.id}
                                    style={styles.recentActivityItem}
                                    onPress={() =>
                                        router.push(`/(tabs)/contact-detail?id=${contact.id}`)
                                    }
                                >
                                    {contact.cardImageUri ? (
                                        <Image
                                            source={{ uri: contact.cardImageUri }}
                                            style={styles.recentActivityImage}
                                            contentFit="cover"
                                        />
                                    ) : (
                                        <View
                                            style={[
                                                styles.recentActivityImage,
                                                {
                                                    backgroundColor: getCompanyColor(
                                                        contact.company || ''
                                                    ),
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                },
                                            ]}
                                        >
                                            <Text style={{ color: '#fff', fontWeight: '600' }}>
                                                {getInitials(contact.name)}
                                            </Text>
                                        </View>
                                    )}
                                    <View style={styles.recentActivityInfo}>
                                        <Text style={styles.recentActivityName}>{contact.name}</Text>
                                        <Text style={styles.recentActivityCompany}>
                                            {contact.company || 'No company'}
                                        </Text>
                                        {contact.tags && contact.tags.length > 0 && (
                                            <View style={{ marginTop: 2 }}>
                                                <TagList tags={contact.tags.slice(0, 2)} maxDisplay={2} />
                                            </View>
                                        )}
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={colors.tertiary} />
                                </Pressable>
                            ))}
                        </View>
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            <Pressable
                style={[styles.fab, { backgroundColor: colors.accent }]}
                onPress={handleScanCard}
            >
                <Ionicons name="add" size={32} color="#fff" />
            </Pressable>
        </View>
    )
}

export default function Dashboard() {
    return (
        <ScreenErrorBoundary screenName="Dashboard">
            <DashboardScreen />
        </ScreenErrorBoundary>
    )
}
