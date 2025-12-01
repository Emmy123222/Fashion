// src/screens/HomeScreen.tsx
import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, RefreshControl, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';

type OutfitItem = {
  id: string;
  username: string;
  userAvatar: any; // or string if using URL
  image: any; // or string if using URL
  likes: number;
  comments: number;
  isLiked: boolean;
  caption: string;
  timeAgo: string;
};

const initialOutfits: OutfitItem[] = [
  {
    id: '1',
    username: 'fashionista123',
    userAvatar: require('../../assets/icon.png'),
    image: require('../../assets/icon.png'),
    likes: 245,
    comments: 32,
    isLiked: false,
    caption: 'Loving this summer look! ☀️ #summer #fashion',
    timeAgo: '2h ago',
  },
  // Add more outfits as needed
];

export const HomeScreen = () => {
  const [outfits, setOutfits] = useState<OutfitItem[]>(initialOutfits);
  const [refreshing, setRefreshing] = useState(false);

  const handleLike = (id: string) => {
    setOutfits(outfits.map(item => 
      item.id === id 
        ? { 
            ...item, 
            isLiked: !item.isLiked,
            likes: item.isLiked ? item.likes - 1 : item.likes + 1
          } 
        : item
    ));
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate network request
    setTimeout(() => {
      setOutfits(initialOutfits);
      setRefreshing(false);
    }, 1000);
  };

  const renderOutfit = ({ item }: { item: OutfitItem }) => (
    <View style={styles.outfitCard}>
      <View style={styles.outfitHeader}>
        <Image source={item.userAvatar} style={styles.avatar} />
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.timeAgo}>{item.timeAgo}</Text>
      </View>

      <Image source={item.image} style={styles.outfitImage} />

      <View style={styles.outfitActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleLike(item.id)}
        >
          <MaterialIcons 
            name={item.isLiked ? 'favorite' : 'favorite-border'} 
            size={24} 
            color={item.isLiked ? theme.colors.danger : theme.colors.text} 
          />
          <Text style={styles.actionText}>{item.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="chat-bubble-outline" size={24} color={theme.colors.text} />
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="share" size={24} color={theme.colors.text} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.caption} numberOfLines={2}>
        <Text style={styles.captionUser}>{item.username} </Text>
        {item.caption}
      </Text>

      <TouchableOpacity>
        <Text style={styles.viewComments}>
          View all {item.comments} comments
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
        <TouchableOpacity>
          <MaterialIcons name="search" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={outfits}
        renderItem={renderOutfit}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="style" size={48} color={theme.colors.gray} />
            <Text style={styles.emptyStateText}>No outfits to show</Text>
            <Text style={styles.emptyStateSubtext}>Follow users or upload your own outfits to see them here</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray + '20',
  },
  title: {
    ...theme.text.h1,
    color: theme.colors.primary,
  },
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
  outfitCard: {
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    paddingBottom: theme.spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  outfitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: theme.spacing.sm,
  },
  username: {
    ...theme.text.body,
    fontWeight: '600',
    flex: 1,
  },
  timeAgo: {
    ...theme.text.caption,
    color: theme.colors.gray,
  },
  outfitImage: {
    width: '100%',
    height: 375, // Adjust as needed
  },
  outfitActions: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray + '20',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.xl,
  },
  actionText: {
    ...theme.text.body,
    marginLeft: theme.spacing.xs,
  },
  caption: {
    ...theme.text.body,
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  captionUser: {
    fontWeight: '600',
  },
  viewComments: {
    ...theme.text.caption,
    color: theme.colors.gray,
    paddingHorizontal: theme.spacing.md,
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyStateText: {
    ...theme.text.h3,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  emptyStateSubtext: {
    ...theme.text.body,
    color: theme.colors.gray,
    textAlign: 'center',
  },
});