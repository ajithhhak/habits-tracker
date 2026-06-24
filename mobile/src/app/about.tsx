import { View, ScrollView, TouchableOpacity, StyleSheet, Image, Linking, Dimensions } from 'react-native';
import { Text } from '@/components/CustomText';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, G, Text as SvgText, TSpan } from 'react-native-svg';

const { width } = Dimensions.get('window');

function PieChart() {
  const radius = 60;
  const strokeWidth = 120; // Fill to center
  const circumference = 2 * Math.PI * radius;
  
  // Hardware 44%, Robotics 34%, Software 22%
  const hwL = 0.44 * circumference;
  const robL = 0.34 * circumference;
  const swL = 0.22 * circumference;

  return (
    <View style={styles.pieContainer}>
      <Svg height="240" width="240" viewBox="0 0 240 240">
        <G rotation="-90" origin="120, 120">
          {/* Hardware (#111) */}
          <Circle r={radius} cx="120" cy="120" fill="transparent" stroke="#111" strokeWidth={strokeWidth} strokeDasharray={[hwL, circumference].join(',')} strokeDashoffset={0} />
          {/* Robotics (#e2e8f0) */}
          <Circle r={radius} cx="120" cy="120" fill="transparent" stroke="#e2e8f0" strokeWidth={strokeWidth} strokeDasharray={[robL, circumference].join(',')} strokeDashoffset={-hwL} />
          {/* Software (#8b5cf6) */}
          <Circle r={radius} cx="120" cy="120" fill="transparent" stroke="#8b5cf6" strokeWidth={strokeWidth} strokeDasharray={[swL, circumference].join(',')} strokeDashoffset={-(hwL + robL)} />
        </G>
        {/* Inner Donut Hole */}
        <Circle r="55" cx="120" cy="120" fill="#fff" />

        {/* Center Text */}
        <SvgText x="120" y="120" textAnchor="middle" alignmentBaseline="middle" fill="#1e293b" fontSize="16" fontFamily="Inter_800ExtraBold">
          Skills
        </SvgText>

        {/* Hardware Label (Approx 22% -> x:193, y:105) */}
        <SvgText x="193" y="98" textAnchor="middle" fill="#fff" fontSize="12" fontFamily="Inter_800ExtraBold">
          Hardware
        </SvgText>
        <SvgText x="193" y="114" textAnchor="middle" fill="#fff" fontSize="11" fontFamily="Inter_400Regular" opacity="0.8">
          44%
        </SvgText>

        {/* Robotics Label (Approx 61% -> x:72, y:177) */}
        <SvgText x="72" y="170" textAnchor="middle" fill="#1e293b" fontSize="12" fontFamily="Inter_800ExtraBold">
          Robotics
        </SvgText>
        <SvgText x="72" y="186" textAnchor="middle" fill="#1e293b" fontSize="11" fontFamily="Inter_400Regular" opacity="0.8">
          34%
        </SvgText>

        {/* Software Label (Approx 89% -> x:72, y:62) */}
        <SvgText x="72" y="55" textAnchor="middle" fill="#fff" fontSize="12" fontFamily="Inter_800ExtraBold">
          Software
        </SvgText>
        <SvgText x="72" y="71" textAnchor="middle" fill="#fff" fontSize="11" fontFamily="Inter_400Regular" opacity="0.8">
          22%
        </SvgText>
      </Svg>
    </View>
  );
}

export default function About() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.logoBadge}><Text style={styles.logoText}>A</Text></View>
        <Text style={styles.topBarText}>ajithkumar</Text>
      </View>

      <View style={styles.arrowWrapper}>
        <View style={styles.arrowDown} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        
        <Text style={styles.mainTitle}>Wow, a whole page just about me!</Text>

        <View style={styles.photoContainer}>
          <Image 
            source={require('../../assets/images/profile.jpeg')} 
            style={styles.photo} 
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Me talking about myself</Text>
        </View>

        <Text style={styles.bio}>
          Final-year ECE student bridging hardware and software. I build intelligent electronics, embedded systems, and full-stack web applications, leveraging prompt engineering to optimize workflows and create scalable solutions.
        </Text>

        <View style={styles.socialSection}>
          <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#8b5cf6' }]} onPress={() => Linking.openURL('https://ajithkumarch.vercel.app/')}>
            <Ionicons name="globe-outline" size={26} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#0077b5' }]} onPress={() => Linking.openURL('https://www.linkedin.com/in/ajith-kumar-choudoju-37181a2b7')}>
            <Ionicons name="logo-linkedin" size={26} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#333' }]} onPress={() => Linking.openURL('https://github.com/ajithhhak')}>
            <Ionicons name="logo-github" size={26} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
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

        <View style={styles.divider} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>I'm a hardware guy</Text>
        </View>
        <View style={styles.list}>
          <View style={styles.listItem}><View style={styles.dot}/><Text style={styles.listText}>Good at core ECE subjects</Text></View>
          <View style={styles.listItem}><View style={styles.dot}/><Text style={styles.listText}>Embedded Systems</Text></View>
          <View style={styles.listItem}><View style={styles.dot}/><Text style={styles.listText}>Robotics & Automation</Text></View>
          <View style={styles.listItem}><View style={styles.dot}/><Text style={styles.listText}>Hardware integration</Text></View>
        </View>

        <PieChart />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>I also do some coding</Text>
        </View>
        <View style={styles.list}>
          <View style={styles.listItem}><View style={styles.dot}/><Text style={styles.listText}>C Language (Proficient)</Text></View>
          <View style={styles.listItem}><View style={styles.dot}/><Text style={styles.listText}>Full-stack Web Dev</Text></View>
          <View style={styles.listItem}><View style={styles.dot}/><Text style={styles.listText}>Prompt Engineering</Text></View>
          <View style={styles.listItem}><View style={styles.dot}/><Text style={styles.listText}>Python & Java</Text></View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  topBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', paddingHorizontal: 24, paddingVertical: 16, zIndex: 10 },
  logoBadge: { width: 32, height: 32, backgroundColor: '#fff', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  logoText: { color: '#000', fontSize: 18, fontWeight: '900' },
  topBarText: { color: '#fff', fontSize: 20, fontWeight: '700', letterSpacing: -0.5 },
  arrowWrapper: { alignItems: 'center', zIndex: 5 },
  arrowDown: { width: 0, height: 0, borderLeftWidth: 12, borderRightWidth: 12, borderTopWidth: 12, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#111', marginTop: -1 },
  scroll: { flex: 1 },
  content: { padding: 24, paddingBottom: 60 },
  mainTitle: { fontSize: 32, fontWeight: '400', color: '#0f172a', textAlign: 'center', marginTop: 20, marginBottom: 40, letterSpacing: -1 },
  photoContainer: { alignItems: 'center', marginBottom: 40 },
  photo: { width: 200, height: 200, borderWidth: 6, borderColor: '#fff', transform: [{ rotate: '-3deg' }], shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 10, backgroundColor: '#f1f5f9' },
  sectionHeader: { borderBottomWidth: 1, borderBottomColor: '#cbd5e1', alignSelf: 'flex-start', paddingBottom: 6, marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '400', color: '#1e293b' },
  bio: { fontSize: 16, color: '#64748b', fontStyle: 'italic', lineHeight: 26, marginBottom: 24 },
  socialSection: { flexDirection: 'row', gap: 16, marginBottom: 40 },
  socialBtn: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 24 },
  statBox: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 32, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#64748b', textAlign: 'center', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 32 },
  list: { marginBottom: 32 },
  listItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#0f172a', marginRight: 12 },
  listText: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  pieContainer: { alignItems: 'center', marginVertical: 40, position: 'relative' },
  pieSvg: { transform: [{ rotate: '-90deg' }] },
  pieLabel: { position: 'absolute' },
  pieLabelText: { fontSize: 12, fontWeight: '800' },
  pieLabelPct: { fontSize: 11, fontWeight: '400', marginTop: 2 },
  pieCenter: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  pieCenterText: { fontSize: 16, fontWeight: '800', color: '#1e293b' }
});
