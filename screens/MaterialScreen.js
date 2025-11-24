import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const MaterialsScreen = ({ navigation, route }) => {
  const { materials, subject } = route.params || {};
  const materialData = materials || [];
  
  console.log("materials", materialData);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleMaterialPress = (material) => {
    if (material.content_type === 'video' || material.type === 'video') {
      navigation.navigate('VideoPlayer', { material });
    } else if (material.content_type === 'pdf' || material.type === 'pdf') {
      navigation.navigate('PDFViewer', { material });
    } else {
      // Default to lesson detail for other types
      navigation.navigate('LessonDetail', { material });
    }
  };

  const getMaterialIcon = (material) => {
    const type = material.content_type || material.type;
    
    switch (type?.toLowerCase()) {
      case 'video':
        return { icon: 'play-circle', color: '#b3b72b' };
      case 'pdf':
        return { icon: 'document-text', color: '#ff0000ff' };
      case 'doc':
      case 'document':
        return { icon: 'document', color: '#45B7D1' };
      case 'audio':
        return { icon: 'musical-notes', color: '#FFD93D' };
      case 'image':
        return { icon: 'image', color: '#6BCF7F' };
      default:
        return { icon: 'document', color: '#b3b72b' };
    }
  };

  const getMaterialTypeText = (material) => {
    const type = material.content_type || material.type;
    return type ? type.toUpperCase() : 'FILE';
  };

  const getDurationText = (material) => {
    if (material.duration) {
      return `${material.duration}`;
    }
    return material.content_type.toLowerCase() === 'video' ? 'Watch' : 'Read';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Materials List */}
        <View style={styles.materialsList}>
          {materialData.length > 0 ? (
            materialData.map((material, index) => {
              const materialIcon = getMaterialIcon(material);
              
              return (
                <TouchableOpacity 
                  key={index}
                  style={styles.materialCard}
                  onPress={() => handleMaterialPress(material)}
                >
                  <View style={styles.materialContent}>
                    {/* Material Icon */}
                    <View style={[styles.materialIcon, { backgroundColor: materialIcon.color }]}>
                      <Icon name={materialIcon.icon} size={24} color="#FFFFFF" />
                    </View>

                    {/* Material Info */}
                    <View style={styles.materialInfo}>
                      <Text style={styles.materialTitle} numberOfLines={2}>
                        {material.name || material.title}
                      </Text>
                      <View style={styles.materialMeta}>
                        <View style={styles.materialTypeBadge}>
                          <Text style={styles.materialTypeText}>
                            {getMaterialTypeText(material)}
                          </Text>
                        </View>
                        <Text style={styles.materialDuration}>
                          {getDurationText(material)}
                        </Text>
                      </View>
                    </View>

                    {/* Action Button */}
                    <View style={styles.actionButton}>
                      {material.content_type === 'video' || material.type === 'video' ? (
                        <View style={[styles.playButton, { backgroundColor: materialIcon.color }]}>
                          <Icon name="play" size={16} color="#FFFFFF" />
                        </View>
                      ) : (
                        <View style={[styles.viewButton, { backgroundColor: materialIcon.color }]}>
                          <Icon name="eye" size={16} color="#FFFFFF" />
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Progress Bar (if applicable) */}
                  {(material.progress || material.completed) && (
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View 
                          style={[
                            styles.progressFill, 
                            { width: material.completed ? '100%' : `${material.progress || 0}%` }
                          ]} 
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {material.completed ? 'Completed' : `${material.progress || 0}%`}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          ) : (
            /* Empty State */
            <View style={styles.emptyState}>
              <Icon name="document-outline" size={64} color="#CCCCCC" />
              <Text style={styles.emptyStateTitle}>No Materials Available</Text>
              <Text style={styles.emptyStateText}>
                There are no learning materials for this subject yet.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Header Styles (Same as HomeScreen)
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 100,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  userDetails: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#b3b72b',
    marginBottom: 4,
  },
  welcome: {
    fontSize: 14,
    color: 'rgba(48, 47, 47, 0.9)',
  },
  loginButton: {
    backgroundColor: 'rgba(16, 16, 16, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(35, 35, 35, 0.5)',
  },
  loginButtonText: {
    color: '#b3b72b',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  // Back Button
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  backText: {
    fontSize: 16,
    color: '#b3b72b',
    marginLeft: 8,
    fontWeight: '600',
  },
  // Page Header
  pageHeader: {
    padding: 16,
    paddingBottom: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  // Materials List
  materialsList: {
    paddingHorizontal: 16,
  },
  materialCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  materialContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  materialIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  materialInfo: {
    flex: 1,
  },
  materialTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  materialMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  materialTypeBadge: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
  },
  materialTypeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  materialDuration: {
    fontSize: 12,
    color: '#666',
  },
  actionButton: {
    marginLeft: 12,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Progress Bar
  progressContainer: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#b3b72b',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Quick Actions
  quickActions: {
    padding: 16,
    marginTop: 20,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  quickActionText: {
    fontSize: 14,
    color: '#b3b72b',
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 20,
  },
});

export default MaterialsScreen;