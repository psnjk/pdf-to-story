import {useState} from 'react';
import {View, Text, Button, ActivityIndicator, StyleSheet} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import {useRouter} from 'expo-router';

type StoryData = Array<{ title: string; summary: string }>;

export default function Index() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function pickPdf() {
        setError(null);
        const result = await DocumentPicker.getDocumentAsync({type: 'application/pdf'});
        if (result.canceled) return;

        const file = result.assets[0];
        setLoading(true);
        setStatus('Extracting PDF...');

        try {
            const fd = new FormData();
            if (file.file) {
                fd.append('pdf', file.file);
            } else {
                const res = await fetch(file.uri);
                const blob = await res.blob();
                fd.append('pdf', blob, file.name);
            }

            const exRes = await fetch('http://localhost:5050/extract', {method: 'POST', body: fd});
            if (!exRes.ok) throw new Error('Extract failed');
            const {text} = await exRes.json();

            setStatus('Generating story...');
            const genRes = await fetch('http://localhost:5050/generate', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({text})
            });
            if (!genRes.ok) throw new Error('Generate failed');
            const data: StoryData = await genRes.json();

            router.push({pathname: '/story', params: {data: JSON.stringify(data)}});
            setLoading(false);
            setStatus('');
        } catch (e: any) {
            setError(e.message);
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator/>
                <Text>{status}</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={{color: 'red'}}>{error}</Text>
                <Button title="Try Again" onPress={() => setError(null)}/>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>PDF to Story</Text>
            <Button title="Pick PDF" onPress={pickPdf}/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20
    }
});
