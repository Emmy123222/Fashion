// AI Fashion Item Generator Screen (Admin Only)
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { theme } from '../../theme';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Loader } from '../../components/common/Loader';
import { groqImageService } from '../../services/ai/groqImageService';
import { FashionCategory, PlayerType } from '../../types/fashion.types';

export const AIGeneratorScreen: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<any[]>([]);

  const generateItems = async (category: FashionCategory, playerType: PlayerType, count: number) => {
    try {
      setIsGenerating(true);
      console.log(`🎨 Generating ${count} ${category} for ${playerType}...`);

      const result = await groqImageService.generateFashionItems(
        category,
        playerType,
        count
      );

      if (result.success && result.data) {
        setLastGenerated(result.data);
        Alert.alert(
          'Success!',
          `Generated ${result.data.length} ${category} items for ${playerType} players.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', result.error?.message || 'Failed to generate items');
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMixed = async (playerType: PlayerType) => {
    try {
      setIsGenerating(true);
      console.log(`🎨 Generating mixed items for ${playerType}...`);

      const result = await groqImageService.generateMixedItems(playerType, 30);

      if (result.success && result.data) {
        setLastGenerated(result.data);
        Alert.alert(
          'Success!',
          `Generated ${result.data.length} mixed fashion items for ${playerType} players.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', result.error?.message || 'Failed to generate items');
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <View style={styles.container}>
        <Loader text="AI is generating fashion items..." />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>🤖 AI Fashion Generator</Text>
      <Text style={styles.subtitle}>
        Generate fashion items using Groq Cloud AI
      </Text>

      {/* Quick Generate */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Generate</Text>
        
        <Button
          title="Generate 30 Mixed Items (Child)"
          onPress={() => generateMixed('child')}
          style={styles.button}
        />
        
        <Button
          title="Generate 30 Mixed Items (Teen)"
          onPress={() => generateMixed('teen')}
          style={styles.button}
        />
        
        <Button
          title="Generate 30 Mixed Items (Adult)"
          onPress={() => generateMixed('adult')}
          style={styles.button}
        />
      </Card>

      {/* Category Specific */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Generate by Category</Text>
        
        <Text style={styles.categoryLabel}>Shoes</Text>
        <View style={styles.buttonRow}>
          <Button
            title="Child"
            onPress={() => generateItems('shoes', 'child', 10)}
            size="small"
            style={styles.smallButton}
          />
          <Button
            title="Teen"
            onPress={() => generateItems('shoes', 'teen', 10)}
            size="small"
            style={styles.smallButton}
          />
          <Button
            title="Adult"
            onPress={() => generateItems('shoes', 'adult', 10)}
            size="small"
            style={styles.smallButton}
          />
        </View>

        <Text style={styles.categoryLabel}>Dresses</Text>
        <View style={styles.buttonRow}>
          <Button
            title="Child"
            onPress={() => generateItems('dresses', 'child', 10)}
            size="small"
            style={styles.smallButton}
          />
          <Button
            title="Teen"
            onPress={() => generateItems('dresses', 'teen', 10)}
            size="small"
            style={styles.smallButton}
          />
          <Button
            title="Adult"
            onPress={() => generateItems('dresses', 'adult', 10)}
            size="small"
            style={styles.smallButton}
          />
        </View>

        <Text style={styles.categoryLabel}>Hats</Text>
        <View style={styles.buttonRow}>
          <Button
            title="Child"
            onPress={() => generateItems('hats', 'child', 10)}
            size="small"
            style={styles.smallButton}
          />
          <Button
            title="Teen"
            onPress={() => generateItems('hats', 'teen', 10)}
            size="small"
            style={styles.smallButton}
          />
          <Button
            title="Adult"
            onPress={() => generateItems('hats', 'adult', 10)}
            size="small"
            style={styles.smallButton}
          />
        </View>

        <Text style={styles.categoryLabel}>Accessories</Text>
        <View style={styles.buttonRow}>
          <Button
            title="Child"
            onPress={() => generateItems('accessories', 'child', 10)}
            size="small"
            style={styles.smallButton}
          />
          <Button
            title="Teen"
            onPress={() => generateItems('accessories', 'teen', 10)}
            size="small"
            style={styles.smallButton}
          />
          <Button
            title="Adult"
            onPress={() => generateItems('accessories', 'adult', 10)}
            size="small"
            style={styles.smallButton}
          />
        </View>
      </Card>

      {/* Last Generated */}
      {lastGenerated.length > 0 && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Last Generated ({lastGenerated.length} items)</Text>
          {lastGenerated.slice(0, 5).map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemName}>• {item.name}</Text>
              <Text style={styles.itemCategory}>{item.category}</Text>
            </View>
          ))}
          {lastGenerated.length > 5 && (
            <Text style={styles.moreText}>
              ...and {lastGenerated.length - 5} more
            </Text>
          )}
        </Card>
      )}

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          💡 Generated items are automatically saved to the database and available in the game immediately.
        </Text>
        <Text style={styles.infoText}>
          🎨 AI creates age-appropriate styles: cartoon for children, stylish for teens, realistic for adults.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
  },
  title: {
    ...theme.text.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.text.body,
    color: theme.colors.gray,
    marginBottom: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.text.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  button: {
    marginBottom: theme.spacing.sm,
  },
  categoryLabel: {
    ...theme.text.body,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  smallButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray + '20',
  },
  itemName: {
    ...theme.text.body,
    color: theme.colors.text,
    flex: 1,
  },
  itemCategory: {
    ...theme.text.caption,
    color: theme.colors.gray,
    textTransform: 'capitalize',
  },
  moreText: {
    ...theme.text.caption,
    color: theme.colors.gray,
    marginTop: theme.spacing.sm,
    fontStyle: 'italic',
  },
  infoBox: {
    backgroundColor: theme.colors.primary + '10',
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.lg,
  },
  infoText: {
    ...theme.text.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
});
