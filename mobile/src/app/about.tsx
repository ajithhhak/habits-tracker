import { View, ScrollView, Text, StyleSheet, Image, TouchableOpacity, Linking, Platform } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.topBarBrand}>
          <View style={styles.brandA}><Text style={styles.brandAText}>A</Text></View>
          <Text style={styles.brandText}>ajithkumar</Text>
        </View>
        <View style={{width: 24}} />
      </View>
      <View style={styles.triangle} />

      <View style={styles.body}>
        <Text style={styles.mainTitle}>Wow, a whole page just about me!</Text>

        <View style={styles.photoContainer}>
          <View style={styles.photoFrame}>
            <Image 
              source={require('../../assets/images/profile.jpeg')} 
              style={styles.photo}
            />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Me talking about myself</Text>
          <View style={styles.sectionUnderline} />
        </View>

        <Text style={styles.introText}>
          Final-year ECE student bridging hardware and software. I build intelligent electronics, embedded systems, and full-stack web applications, leveraging prompt engineering to optimize workflows and create scalable solutions.
        </Text>

        <View style={styles.socialRow}>
          <TouchableOpacity onPress={() => Linking.openURL('https://ajithkumarch.vercel.app/')} style={[styles.socialBtn, {backgroundColor: '#8b5cf6'}]}>
            <Ionicons name="globe-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://www.linkedin.com/in/ajith-kumar-choudoju-37181a2b7')} style={[styles.socialBtn, {backgroundColor: '#0077b5'}]}>
            <Ionicons name="logo-linkedin" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://github.com/ajithhhak')} style={[styles.socialBtn, {backgroundColor: '#333'}]}>
            <Ionicons name="logo-github" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>4</Text>
            <Text style={styles.statLabel}>Projects in{'\n'}Electronics</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>2</Text>
            <Text style={styles.statLabel}>Projects in{'\n'}Software</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>3+</Text>
            <Text style={styles.statLabel}>Builds in{'\n'}Robotics</Text>
          </View>
        </View>

        <View style={styles.skillsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>I'm a hardware guy</Text>
            <View style={styles.sectionUnderline} />
          </View>
          {['Good at core ECE subjects', 'Embedded Systems', 'Robotics & Automation', 'Hardware integration'].map(s => (
            <View key={s} style={styles.listItem}>
              <View style={styles.bullet} />
              <Text style={styles.listText}>{s}</Text>
            </View>
          ))}

          {/* Mathematical SVG Donut Chart */}
          <View style={styles.pieContainer}>
            <View style={{position: 'relative', width: 240, height: 240, alignItems: 'center', justifyContent: 'center'}}>
              {/* Svg is not imported yet, I need to import it at the top */}
              <View style={styles.pieLegendItemHardware}>
                <Text style={styles.pieLegendTitle}>Hardware</Text>
                <Text style={styles.pieLegendSub}>44%</Text>
              </View>
              <View style={styles.pieLegendItemRobotics}>
                <Text style={styles.pieLegendTitle}>Robotics</Text>
                <Text style={styles.pieLegendSub}>34%</Text>
              </View>
              <View style={styles.pieLegendItemSoftware}>
                <Text style={styles.pieLegendTitle}>Software</Text>
                <Text style={styles.pieLegendSub}>22%</Text>
              </View>
              
              <Svg width="240" height="240" viewBox="0 0 240 240" style={{ transform: [{ rotate: '-90deg' }] }}>
                <Circle cx="120" cy="120" r="80" stroke="#111" strokeWidth="40" fill="transparent" strokeDasharray="502.65" strokeDashoffset="0" />
                <Circle cx="120" cy="120" r="80" stroke="#e2e8f0" strokeWidth="40" fill="transparent" strokeDasharray="502.65" strokeDashoffset="-221.16" />
                <Circle cx="120" cy="120" r="80" stroke="#8b5cf6" strokeWidth="40" fill="transparent" strokeDasharray="502.65" strokeDashoffset="-392.06" />
              </Svg>
              
              <View style={{ position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 2 }}>
                <Text style={styles.pieText}>Skills</Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>I also do some coding</Text>
            <View style={styles.sectionUnderline} />
          </View>
          {['C Language (Proficient)', 'Full-stack Web Dev', 'Prompt Engineering', 'Python & Java'].map(s => (
            <View key={s} style={styles.listItem}>
              <View style={styles.bullet} />
              <Text style={styles.listText}>{s}</Text>
            </View>
          ))}
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  contentContainer: { paddingBottom: 60 },
  topBar: {
    backgroundColor: '#111',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    zIndex: 10,
  },
  backButton: { padding: 4 },
  topBarBrand: { flexDirection: 'row', alignItems: 'center' },
  brandA: {
    backgroundColor: '#fff',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  brandAText: { color: '#000', fontWeight: '900', fontSize: 18 },
  brandText: { color: '#fff', fontSize: 20, fontWeight: '700', letterSpacing: -0.5 },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#111',
    alignSelf: 'center',
    zIndex: 10,
  },
  body: { paddingHorizontal: 24, paddingTop: 40 },
  mainTitle: { fontSize: 36, fontWeight: '400', textAlign: 'center', color: '#0f172a', marginBottom: 40, letterSpacing: -1 },
  photoContainer: { alignItems: 'center', marginBottom: 40 },
  photoFrame: {
    backgroundColor: '#fff',
    padding: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    transform: [{ rotate: '-3deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  photo: { width: 220, height: 220, backgroundColor: '#f1f5f9' },
  sectionHeader: { marginBottom: 20, alignSelf: 'flex-start' },
  sectionTitle: { fontSize: 22, fontWeight: '400', color: '#1e293b' },
  sectionUnderline: { height: 1, backgroundColor: '#cbd5e1', marginTop: 8, width: '100%' },
  introText: { fontSize: 18, fontStyle: 'italic', color: '#64748b', lineHeight: 28, marginBottom: 30 },
  socialRow: { flexDirection: 'row', gap: 16, marginBottom: 40 },
  socialBtn: {
    width: 50, height: 50, borderRadius: 25,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 4
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 30, marginBottom: 40 },
  statBox: { alignItems: 'center', flex: 1 },
  statNum: { fontSize: 36, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#64748b', textAlign: 'center', fontWeight: '500' },
  skillsSection: { borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 40 },
  listItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  bullet: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#1e293b', marginRight: 12 },
  listText: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  pieContainer: { alignItems: 'center', marginVertical: 60 },
  pieText: { fontWeight: '700', color: '#1e293b', fontSize: 16 },
  pieLegendItemHardware: { position: 'absolute', top: '50%', right: -30, marginTop: -15, alignItems: 'center', zIndex: 10 },
  pieLegendItemRobotics: { position: 'absolute', bottom: -20, left: 30, alignItems: 'center', zIndex: 10 },
  pieLegendItemSoftware: { position: 'absolute', top: -20, left: 30, alignItems: 'center', zIndex: 10 },
  pieLegendTitle: { fontSize: 12, fontWeight: '700', color: '#1e293b' },
  pieLegendSub: { fontSize: 11, color: '#64748b' }
});
