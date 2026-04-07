import {Stack} from 'expo-router';

export default function RootLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: 'Upload PDF',
                }}
            />
            <Stack.Screen
                name="story"
                options={{
                    title: 'Your Story',
                }}
            />
        </Stack>
    );
}
