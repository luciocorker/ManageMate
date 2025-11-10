import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, G, Path, Rect, Text as SvgText } from "react-native-svg";

// Current user
const CURRENT_USER = "Lee";

// Dummy data for recent projects
const RECENT_PROJECTS = [
  {
    id: 1,
    name: "Website Redesign",
    date: "Nov 8, 2025",
    status: "In Progress",
  },
  {
    id: 2,
    name: "Mobile App Launch",
    date: "Nov 5, 2025",
    status: "Completed",
  },
  { id: 3, name: "Database Migration", date: "Nov 3, 2025", status: "Pending" },
  {
    id: 4,
    name: "API Integration",
    date: "Nov 1, 2025",
    status: "In Progress",
  },
];

// Quick stats data
const QUICK_STATS = {
  totalProjects: 12,
  totalChannels: 8,
  totalFriends: 15,
};

// Project status distribution (for pie chart)
const PROJECT_STATUS_DATA = [
  { status: "Completed", count: 5, color: "#10B981" },
  { status: "In Progress", count: 4, color: "#F59E0B" },
  { status: "Pending", count: 3, color: "#DC2626" },
];

// Channel activity data (for bar chart)
const CHANNEL_ACTIVITY_DATA = [
  { name: "General", messages: 45, color: "#DC2626" },
  { name: "Dev Team", messages: 32, color: "#F59E0B" },
  { name: "Design", messages: 28, color: "#10B981" },
  { name: "Marketing", messages: 15, color: "#3B82F6" },
];

// SVG Icons
const ProjectIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 11L12 14L22 4M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ChannelIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const FriendsIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ArrowRightIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 12H19M19 12L12 5M19 12L12 19"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Simple Pie Chart Component
const SimplePieChart = ({ data }: { data: typeof PROJECT_STATUS_DATA }) => {
  const size = 160;
  const center = size / 2;
  const radius = 60;

  let currentAngle = -90;
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <View style={styles.pieChartContainer}>
      <Svg width={size} height={size}>
        {data.map((item, index) => {
          const percentage = item.count / total;
          const angle = percentage * 360;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;

          const startX =
            center + radius * Math.cos((startAngle * Math.PI) / 180);
          const startY =
            center + radius * Math.sin((startAngle * Math.PI) / 180);
          const endX = center + radius * Math.cos((endAngle * Math.PI) / 180);
          const endY = center + radius * Math.sin((endAngle * Math.PI) / 180);

          const largeArcFlag = angle > 180 ? 1 : 0;

          const pathData = [
            `M ${center} ${center}`,
            `L ${startX} ${startY}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
            "Z",
          ].join(" ");

          currentAngle = endAngle;

          return <Path key={index} d={pathData} fill={item.color} />;
        })}
        <Circle cx={center} cy={center} r={30} fill="#1E1E1E" />
      </Svg>

      <View style={styles.pieChartLegend}>
        {data.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: item.color }]}
            />
            <Text style={styles.legendText}>
              {item.status}: {item.count}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// Simple Bar Chart Component
const SimpleBarChart = ({ data }: { data: typeof CHANNEL_ACTIVITY_DATA }) => {
  const maxMessages = Math.max(...data.map((d) => d.messages));
  const barWidth = 50;
  const chartHeight = 150;
  const chartWidth = data.length * (barWidth + 20) + 20;

  return (
    <View style={styles.barChartContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Svg width={chartWidth} height={chartHeight + 40}>
          {data.map((item, index) => {
            const barHeight = (item.messages / maxMessages) * chartHeight;
            const x = index * (barWidth + 20) + 20;
            const y = chartHeight - barHeight;

            return (
              <G key={index}>
                <Rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={item.color}
                  rx={4}
                />
                <SvgText
                  x={x + barWidth / 2}
                  y={y - 5}
                  fill="white"
                  fontSize="12"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {item.messages}
                </SvgText>
                <SvgText
                  x={x + barWidth / 2}
                  y={chartHeight + 20}
                  fill="#999"
                  fontSize="11"
                  textAnchor="middle"
                >
                  {item.name}
                </SvgText>
              </G>
            );
          })}
        </Svg>
      </ScrollView>
    </View>
  );
};

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = () => {
    switch (status) {
      case "Completed":
        return "#10B981";
      case "In Progress":
        return "#F59E0B";
      case "Pending":
        return "#DC2626";
      default:
        return "#6B7280";
    }
  };

  return (
    <View
      style={[styles.statusBadge, { backgroundColor: getStatusColor() + "20" }]}
    >
      <Text style={[styles.statusText, { color: getStatusColor() }]}>
        {status}
      </Text>
    </View>
  );
};

export default function DashboardPage() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.userName}>{CURRENT_USER}</Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <ProjectIcon />
              </View>
              <Text style={styles.statNumber}>{QUICK_STATS.totalProjects}</Text>
              <Text style={styles.statLabel}>Projects</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <ChannelIcon />
              </View>
              <Text style={styles.statNumber}>{QUICK_STATS.totalChannels}</Text>
              <Text style={styles.statLabel}>Channels</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <FriendsIcon />
              </View>
              <Text style={styles.statNumber}>{QUICK_STATS.totalFriends}</Text>
              <Text style={styles.statLabel}>Friends</Text>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.projectsList}>
            {RECENT_PROJECTS.map((project) => (
              <View key={project.id} style={styles.projectCard}>
                <View style={styles.projectInfo}>
                  <Text style={styles.projectName}>{project.name}</Text>
                  <Text style={styles.projectDate}>{project.date}</Text>
                </View>
                <StatusBadge status={project.status} />
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.viewProjectsButton}>
            <Text style={styles.viewProjectsButtonText}>View My Projects</Text>
            <ArrowRightIcon />
          </TouchableOpacity>
        </View>

        {/* Project Status Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Status Distribution</Text>
          <View style={styles.chartCard}>
            <SimplePieChart data={PROJECT_STATUS_DATA} />
          </View>
        </View>

        {/* Channel Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Channel Activity</Text>
          <View style={styles.chartCard}>
            <Text style={styles.chartSubtitle}>Messages per Channel</Text>
            <SimpleBarChart data={CHANNEL_ACTIVITY_DATA} />
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "#121212",
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  welcomeText: {
    fontSize: 16,
    color: "#999",
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  scrollContainer: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  statIconContainer: {
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#999",
  },
  projectsList: {
    gap: 12,
  },
  projectCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginBottom: 4,
  },
  projectDate: {
    fontSize: 13,
    color: "#999",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  viewProjectsButton: {
    backgroundColor: "#DC2626",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    gap: 8,
  },
  viewProjectsButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  chartCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  chartSubtitle: {
    fontSize: 14,
    color: "#999",
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  pieChartContainer: {
    alignItems: "center",
  },
  pieChartLegend: {
    marginTop: 20,
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 14,
    color: "white",
  },
  barChartContainer: {
    width: "100%",
  },
});
