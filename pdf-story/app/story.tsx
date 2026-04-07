import { ScrollView, View, Text, Button, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

type StoryData = Array<{ title: string; summary: string }>;

export default function Story() {
  const { data } = useLocalSearchParams<{ data: string }>();
  const router = useRouter();
  const parsed: StoryData = data ? JSON.parse(data) : [];

  return (
    <View style={styles.outer}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {parsed.map((item, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text>{item.summary}</Text>
          </View>
        ))}
      </ScrollView>
      <Button title="Try Another PDF" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10
  },
  scroll: {
    paddingBottom: 20
  },
  card: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    marginVertical: 10
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 5
  }
});
