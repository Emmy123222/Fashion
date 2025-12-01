// src/screens/ProfileScreen.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';

type PostItem = {
  id: string;
  image: any; // or string if using URL
  likes: number;
  comments: number;
};

// Placeholder images - replace with actual outfit images
const outfitImages = [
  require('../../assets/icon.png'),
  require('../../assets/icon.png'),
  require('../../assets/icon.png'),
];

const profileData = {
  username: 'your_username',
  fullName: 'Your Name',
  bio: 'Fashion enthusiast | Outfit creator | Sharing my daily looks',
  followers: 1243,
  following: 567,
  postsCount: 42,
  avatar: require('../../assets/icon.png'),
  posts: Array(9).fill(0).map((_, i) => ({
    id: `post-${i}`,
    image: outfitImages[i % 3],
    likes: Math.floor(Math.random() * 1000),
    comments: Math.floor(Math.random() * 100),
  })),
};

export const ProfileScreen = () => {

  const renderPost = ({ item }: { item: PostItem }) => (
    <TouchableOpacity style={styles.postContainer}>
      <Image source={item.image} style={styles.postImage} />
      <View style={styles.postOverlay}>
        <View style={styles.postStat}>
          <MaterialIcons name="favorite" size={20} color={theme.colors.white} />
          <Text style={styles.postStatText}>{item.likes}</Text>
        </View>
        <View style={styles.postStat}>
          <MaterialIcons name="chat-bubble" size={20} color={theme.colors.white} />
          <Text style={styles.postStatText}>{item.comments}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <MaterialIcons name="settings" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity>
          <MaterialIcons name="menu" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileHeader}>
        <Image source={profileData.avatar} style={styles.avatar} />
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profileData.posts.length}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profileData.followers}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profileData.following}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
      </View>

      <View style={styles.profileInfo}>
        <Text style={styles.fullName}>{profileData.fullName}</Text>
        <Text style={styles.bio}>{profileData.bio}</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={styles.tabActive}>
          <MaterialIcons name="grid-on" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <MaterialIcons name="bookmark-border" size={24} color={theme.colors.gray} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={profileData.posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.postsGrid}
        showsVerticalScrollIndicator={false}
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
  headerTitle: {
    ...theme.text.h3,
    color: theme.colors.text,
    fontWeight: '600',
  },
  profileHeader: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: theme.spacing.xl,
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...theme.text.h3,
    color: theme.colors.text,
    fontWeight: '600',
  },
  statLabel: {
    ...theme.text.caption,
    color: theme.colors.gray,
  },
  profileInfo: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  fullName: {
    ...theme.text.body,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  bio: {
    ...theme.text.body,
    color: theme.colors.gray,
  },
  tabs: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.gray + '20',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  tabActive: {
    flex: 1,
    alignItems: 'center',
    padding: theme.spacing.md,
    borderTopWidth: 2,
    borderTopColor: theme.colors.primary,
  },
  postsGrid: {
    padding: 1, // For the grid gap effect
  },
  postContainer: {
    flex: 1 / 3,
    aspectRatio: 1,
    margin: 0.5, // Creates a 1px gap between items
    backgroundColor: theme.colors.white,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  postOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    opacity: 0,
  },
  postStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.sm,
  },
  postStatText: {
    ...theme.text.body,
    color: theme.colors.white,
    marginLeft: theme.spacing.xs,
    fontWeight: '600',
  },
});