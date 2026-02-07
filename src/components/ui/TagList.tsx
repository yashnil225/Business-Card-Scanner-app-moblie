import { useColors } from '@/src/hooks/useColors'
import { borderRadius, spacing, type Colors } from '@/src/lib/theme'
import { Ionicons } from '@expo/vector-icons'
import { useMemo, useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'

interface TagListProps {
  tags: string[]
  onAddTag?: () => void
  onRemoveTag?: (tag: string) => void
  onTagPress?: (tag: string) => void
  maxDisplay?: number
  showAddButton?: boolean
}

const PRESET_TAG_COLORS: Record<string, string> = {
  lead: '#4CAF50',
  partner: '#2196F3',
  investor: '#9C27B0',
  client: '#FF9800',
  vendor: '#607D8B',
  competitor: '#F44336',
  prospect: '#00BCD4',
  influencer: '#E91E63',
  other: '#9E9E9E',
  'High Priority': '#F44336',
  'Warm Lead': '#FF9800',
  'Decision Maker': '#4CAF50',
  'Follow Up': '#2196F3',
  Technology: '#3F51B5',
  Healthcare: '#009688',
  Finance: '#607D8B',
  Education: '#673AB7',
  Marketing: '#E91E63',
  Retail: '#795548',
  RealEstate: '#8BC34A',
  Consulting: '#FF5722',
}

function getTagColor(tag: string): string {
  const normalizedTag = tag.replace(/\s+/g, '')
  return PRESET_TAG_COLORS[normalizedTag] || PRESET_TAG_COLORS[tag.toLowerCase()] || PRESET_TAG_COLORS['other']
}

function TagChip({ 
  tag, 
  onRemove, 
  onPress,
  showRemove 
}: { 
  tag: string
  onRemove?: () => void
  onPress?: () => void
  showRemove?: boolean
}) {
  const colors = useColors()
  const tagColor = getTagColor(tag)
  
  return (
    <View style={[styles_tagList.tagChip, { backgroundColor: tagColor + '20' }]}>
      <Pressable 
        onPress={onPress}
        style={({ pressed }) => [styles_tagList.tagPressable, { opacity: pressed ? 0.7 : 1 }]}
      >
        <View style={[styles_tagList.tagDot, { backgroundColor: tagColor }]} />
        <Text style={[styles_tagList.tagText, { color: colors.text }]}>
          {tag}
        </Text>
      </Pressable>
      {showRemove && onRemove && (
        <Pressable onPress={onRemove} style={styles_tagList.removeButton}>
          <Ionicons name="close-circle" size={16} color={colors.text + '80'} />
        </Pressable>
      )}
    </View>
  )
}

export function TagList({ 
  tags, 
  onAddTag, 
  onRemoveTag, 
  onTagPress,
  maxDisplay = 5,
  showAddButton = false
}: TagListProps) {
  const colors = useColors()
  const styles = useMemo(() => createStyles(colors), [colors])
  
  const displayedTags = tags.slice(0, maxDisplay)
  const remainingCount = Math.max(0, tags.length - maxDisplay)

  if (tags.length === 0 && !showAddButton) {
    return null
  }

  return (
    <View style={styles.container}>
      <View style={styles.tagsRow}>
        {displayedTags.map((tag) => (
          <TagChip
            key={tag}
            tag={tag}
            onRemove={onRemoveTag ? () => onRemoveTag(tag) : undefined}
            onPress={onTagPress ? () => onTagPress(tag) : undefined}
            showRemove={!!onRemoveTag}
          />
        ))}
        
        {remainingCount > 0 && (
          <View style={[styles.tagChip, { backgroundColor: colors.surface }]}>
            <Text style={[styles.moreText, { color: colors.text + '80' }]}>
              +{remainingCount}
            </Text>
          </View>
        )}

        {showAddButton && onAddTag && (
          <Pressable 
            onPress={onAddTag}
            style={[styles.addButton, { borderColor: colors.accent }]}
          >
            <Ionicons name="add" size={16} color={colors.accent} />
            <Text style={[styles.addText, { color: colors.accent }]}>
              Add Tag
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  )
}

export function EditableTagList({
  tags,
  allAvailableTags,
  onAddTag,
  onRemoveTag,
}: {
  tags: string[]
  allAvailableTags?: string[]
  onAddTag: (tag: string) => void
  onRemoveTag: (tag: string) => void
}) {
  const colors = useColors()
  const styles = useMemo(() => createStyles(colors), [colors])
  const [newTag, setNewTag] = useState('')
  const [showInput, setShowInput] = useState(false)

  const suggestedTags = allAvailableTags || [
    'High Priority',
    'Follow Up',
    'Nurture',
    'Hot Lead',
    'Conference',
    'Referral',
    'LinkedIn',
    'Cold Outreach',
    'Warm Introduction',
    'Decision Maker',
    'Executive',
    'Technical',
    'Sales',
    'Marketing',
  ]

  const availableSuggestions = suggestedTags.filter(t => !tags.includes(t))

  const handleAddNewTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      onAddTag(newTag.trim())
      setNewTag('')
    }
  }

  return (
    <View style={styles.editableContainer}>
      {tags.length > 0 && (
        <View style={styles.tagsRow}>
          {tags.map((tag) => (
            <TagChip
              key={tag}
              tag={tag}
              onRemove={() => onRemoveTag(tag)}
              showRemove={true}
            />
          ))}
        </View>
      )}

      {showInput ? (
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.tagInput, { 
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text
            }]}
            placeholder="Enter tag name"
            placeholderTextColor={colors.text + '60'}
            value={newTag}
            onChangeText={setNewTag}
            onSubmitEditing={handleAddNewTag}
          />
          <Pressable 
            onPress={handleAddNewTag}
            style={[styles.addTagButton, { backgroundColor: colors.accent }]}
          >
            <Ionicons name="checkmark" size={20} color="#fff" />
          </Pressable>
          <Pressable 
            onPress={() => setShowInput(false)}
            style={[styles.cancelButton, { borderColor: colors.border }]}
          >
            <Ionicons name="close" size={20} color={colors.text + '80'} />
          </Pressable>
        </View>
      ) : (
        <View style={styles.suggestionsContainer}>
          <Pressable 
            onPress={() => setShowInput(true)}
            style={[styles.addNewButton, { borderColor: colors.accent }]}
          >
            <Ionicons name="create-outline" size={16} color={colors.accent} />
            <Text style={[styles.addNewText, { color: colors.accent }]}>
              Create custom tag
            </Text>
          </Pressable>

          {availableSuggestions.length > 0 && (
            <View style={styles.suggestionsRow}>
              {availableSuggestions.slice(0, 6).map((suggestion) => (
                <Pressable
                  key={suggestion}
                  onPress={() => onAddTag(suggestion)}
                  style={[styles.suggestionChip, { borderColor: colors.border }]}
                >
                  <Text style={[styles.suggestionText, { color: colors.text + '80' }]}>
                    + {suggestion}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  )
}

const styles_tagList = StyleSheet.create({
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingLeft: 8,
    paddingRight: 4,
    borderRadius: 16,
    gap: 4,
  },
  tagPressable: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  removeButton: {
    padding: 2,
  },
})

const createStyles = (colors: Colors) => StyleSheet.create({
  container: {
    flexWrap: 'wrap',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingLeft: spacing.sm,
    paddingRight: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  moreText: {
    fontSize: 12,
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    gap: spacing.xs,
  },
  addText: {
    fontSize: 12,
    fontWeight: '500',
  },
  editableContainer: {
    gap: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tagInput: {
    flex: 1,
    height: 36,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: 14,
  },
  addTagButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionsContainer: {
    gap: spacing.sm,
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    gap: spacing.xs,
    alignSelf: 'flex-start',
  },
  addNewText: {
    fontSize: 12,
    fontWeight: '500',
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  suggestionChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 12,
  },
})
