import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { CustomColors } from '../core/colors';
import SafeIcon from './SafeIcon';

interface CustomScaffoldProps {
  children: React.ReactNode;
  title?: string;
  showProfileButton?: boolean;
  showBackButton?: boolean;
  floatingActionButton?: React.ReactNode;
}

const CustomScaffold: React.FC<CustomScaffoldProps> = ({
  children,
  title = 'TrueConnect',
  showProfileButton = true,
  showBackButton = false,
  floatingActionButton,
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            {showBackButton && (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <SafeIcon name="arrow-back" size={24} color={CustomColors.white} />
              </TouchableOpacity>
            )}
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/images/trustme-logo.png')}
                style={styles.logo}
                resizeMode="contain"
                tintColor={CustomColors.white}
              />
            </View>
            <Text style={styles.headerTitle}>{title}</Text>
          </View>
          {showProfileButton && (
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              style={styles.profileButton}
            >
              <SafeIcon name="profile" size={28} color={CustomColors.white} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={styles.content}>
        {children}
      </View>
      {floatingActionButton && (
        <View style={styles.fabContainer}>
          {floatingActionButton}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CustomColors.backgroundPrimaryColor,
  },
  header: {
    backgroundColor: CustomColors.activeColor,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerPlaceholder: {
    width: 32,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  logoContainer: {
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    height: 40,
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: CustomColors.white,
  },
  profileButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});

export default CustomScaffold;

