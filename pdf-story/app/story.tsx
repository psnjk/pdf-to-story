import React, {useState} from 'react';
import {ScrollView, View, Text, TouchableOpacity, StyleSheet, Button} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';

type StoryItem = {
    title: string;
    summary: string;
};

type StoryData = StoryItem[];

export default function Story() {
    const {data} = useLocalSearchParams<{ data: string }>();
    const router = useRouter();
    const parsed: StoryData = data ? JSON.parse(data) : [];

    const [unlockedIndex, setUnlockedIndex] = useState(0);

    const handlePress = (index: number) => {
        if (index <= unlockedIndex) return;
        setUnlockedIndex(index);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {parsed.map((item, index) => {
                const isLocked = index > unlockedIndex;

                return (
                    <React.Fragment key={index}>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => handlePress(index)}
                            style={[styles.card, isLocked && styles.lockedCard]}
                        >
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.summary}>{item.summary}</Text>
                            {index === unlockedIndex + 1 && (
                                <Text style={styles.tapToUnlock}>Tap to unlock</Text>
                            )}
                        </TouchableOpacity>

                        {index < parsed.length - 1 && (
                            <View style={styles.lineWrapper}>
                                <View style={styles.line}/>
                            </View>
                        )}
                    </React.Fragment>
                );
            })}

            <View style={styles.buttonWrapper}>
                <Button title="Try Another PDF" onPress={() => router.back()}/>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: 16,
        alignItems: 'center',
    },
    card: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 16,
        width: '100%',
    },
    lockedCard: {
        opacity: 0.4,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#000',
    },
    summary: {
        fontSize: 14,
        color: '#000',
        lineHeight: 20,
    },
    tapToUnlock: {
        fontSize: 12,
        color: '#888',
        textAlign: 'right',
        marginTop: 8,
    },
    lineWrapper: {
        alignItems: 'center',
        width: '100%',
    },
    line: {
        width: 3,
        height: 32,
        backgroundColor: '#ccc',
    },
    buttonWrapper: {
        marginTop: 24,
        width: '100%',
    },
});
