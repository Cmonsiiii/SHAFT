// components/Accordion.tsx
import React, { useState } from 'react';
import { 
    View, 
    TouchableOpacity, 
    StyleSheet, 
    LayoutAnimation, 
    Platform, 
    UIManager, 
    useColorScheme,
    Text
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotifColors } from '@/constants/Colors';
import { ThemedText } from '../themeUI/ThemedText';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

interface AccordionProps {
    title: string;
    content: string;
    date: string;
}

const Accordion: React.FC<AccordionProps> = ({ title, content, date }) => {
    const [expanded, setExpanded] = useState(false);
    const colorScheme = useColorScheme();

    const themeColors = NotifColors[colorScheme || 'light'];

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    return (
        <View style={[
            styles.container,
            { backgroundColor: themeColors.background }
        ]}>
            <TouchableOpacity 
                style={styles.header} 
                onPress={toggleExpand}
                activeOpacity={0.7}
            >
                <View style={styles.titleContainer}>
                    <ThemedText style={[
                        styles.title,
                        { color: themeColors.color }
                    ]}>
                        {title}
                    </ThemedText>
                    <ThemedText style={[styles.date, {color: themeColors.color}]}>
                        {date}
                    </ThemedText>
                </View>
                <Ionicons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={24}
                    color={themeColors.color}
                />
            </TouchableOpacity>
            
            {expanded && (
                <View style={[
                    styles.content,
                    { backgroundColor: themeColors.background }
                ]}>
                    <ThemedText style={[
                        styles.contentText,
                        { color: themeColors.color }
                    ]}>
                        {content}
                    </ThemedText>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 8,
        marginVertical: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontFamily: 'CeraPro',
        marginBottom: 4,
    },
    date: {
        fontSize: 12,
        color: '#666666',
        fontFamily: 'CeraPro_Light',
    },
    content: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    contentText: {
        fontSize: 14,
        fontFamily: 'CeraPro',
        lineHeight: 20,
    }
});

export default Accordion;