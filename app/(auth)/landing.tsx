import { IconSymbol } from "@/components/ui/icon-symbol";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function LandingScreen() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const faqs = [
    {
      question: "What is ManageMate?",
      answer:
        "ManageMate is a comprehensive task management and team collaboration platform that helps teams organize projects, track progress, and communicate effectively.",
    },
    {
      question: "How does the free plan work?",
      answer:
        "Our free plan includes basic task management, up to 5 team members, 3 projects, and essential collaboration features.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Absolutely. We use enterprise-grade security with end-to-end encryption and regular backups.",
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <LinearGradient
        colors={["#ff6b6b", "#ff8787", "#ffa5a5"]}
        style={styles.heroSection}
      >
        <View style={styles.heroContent}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <IconSymbol name="checkmark.circle.fill" size={40} color="#fff" />
            </View>
            <Text style={styles.logoText}>ManageMate</Text>
          </View>

          <Text style={styles.heroTitle}>
            Task management for{"\n"}
            <Text style={styles.heroHighlight}>modern teams</Text>
          </Text>

          <Text style={styles.heroSubtitle}>
            Organize projects, collaborate seamlessly, and track progress with
            powerful workspaces.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push("/(auth)/signup" as any)}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
              <IconSymbol name="arrow.right" size={20} color="#ff6b6b" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push("/(auth)/signin" as any)}
            >
              <Text style={styles.secondaryButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Features Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Everything you need</Text>
        <Text style={styles.sectionSubtitle}>
          All the tools your team needs to stay productive
        </Text>

        <View style={styles.featuresGrid}>
          <View style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: "#ff6b6b" }]}>
              <IconSymbol name="checkmark.circle.fill" size={32} color="#fff" />
            </View>
            <Text style={styles.featureTitle}>Task Organization</Text>
            <Text style={styles.featureDescription}>
              Create, assign, and track tasks with intuitive project boards
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: "#ff8787" }]}>
              <IconSymbol name="person.2.fill" size={32} color="#fff" />
            </View>
            <Text style={styles.featureTitle}>Team Collaboration</Text>
            <Text style={styles.featureDescription}>
              Communicate seamlessly with built-in messaging and file sharing
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: "#ffa5a5" }]}>
              <IconSymbol name="folder.fill" size={32} color="#fff" />
            </View>
            <Text style={styles.featureTitle}>Workspace Management</Text>
            <Text style={styles.featureDescription}>
              Organize multiple projects in dedicated workspaces
            </Text>
          </View>
        </View>
      </View>

      {/* Pricing Section */}
      <View style={[styles.section, styles.pricingSection]}>
        <Text style={styles.sectionTitle}>Choose your plan</Text>
        <Text style={styles.sectionSubtitle}>
          Start free and scale as you grow
        </Text>

        <View style={styles.pricingCards}>
          <View style={styles.pricingCard}>
            <Text style={styles.planName}>Free</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>$0</Text>
              <Text style={styles.priceUnit}>/month</Text>
            </View>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <IconSymbol name="checkmark.circle" size={20} color="#ff6b6b" />
                <Text style={styles.featureText}>Up to 5 team members</Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol name="checkmark.circle" size={20} color="#ff6b6b" />
                <Text style={styles.featureText}>3 projects</Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol name="checkmark.circle" size={20} color="#ff6b6b" />
                <Text style={styles.featureText}>Basic task management</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.planButton}>
              <Text style={styles.planButtonText}>Get Started</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.pricingCard, styles.popularCard]}>
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>Most Popular</Text>
            </View>
            <Text style={styles.planName}>Pro</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>$12</Text>
              <Text style={styles.priceUnit}>/user/month</Text>
            </View>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <IconSymbol name="checkmark.circle" size={20} color="#ff6b6b" />
                <Text style={styles.featureText}>Unlimited members</Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol name="checkmark.circle" size={20} color="#ff6b6b" />
                <Text style={styles.featureText}>Unlimited projects</Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol name="checkmark.circle" size={20} color="#ff6b6b" />
                <Text style={styles.featureText}>Advanced analytics</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.planButtonPrimary}>
              <Text style={styles.planButtonPrimaryText}>Start Free Trial</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* FAQs Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

        <View style={styles.faqContainer}>
          {faqs.map((faq, index) => (
            <TouchableOpacity
              key={index}
              style={styles.faqItem}
              onPress={() =>
                setExpandedFAQ(expandedFAQ === index ? null : index)
              }
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <IconSymbol
                  name={expandedFAQ === index ? "chevron.up" : "chevron.down"}
                  size={20}
                  color="#ff6b6b"
                />
              </View>
              {expandedFAQ === index && (
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Footer CTA */}
      <LinearGradient colors={["#ff6b6b", "#ff8787"]} style={styles.footerCTA}>
        <Text style={styles.footerTitle}>Ready to get started?</Text>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => router.push("/(auth)/signup" as any)}
        >
          <Text style={styles.footerButtonText}>Create Free Account</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © 2024 ManageMate. All rights reserved.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  heroSection: {
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 20,
  },
  heroContent: {
    alignItems: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 44,
  },
  heroHighlight: {
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.95)",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 26,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#ff6b6b",
    fontSize: 18,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  secondaryButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  section: {
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2d3748",
    textAlign: "center",
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: "#718096",
    textAlign: "center",
    marginBottom: 32,
  },
  featuresGrid: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f7fafc",
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2d3748",
    marginBottom: 8,
    textAlign: "center",
  },
  featureDescription: {
    fontSize: 14,
    color: "#718096",
    textAlign: "center",
    lineHeight: 20,
  },
  pricingSection: {
    backgroundColor: "#f7fafc",
  },
  pricingCards: {
    gap: 16,
  },
  pricingCard: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  popularCard: {
    borderColor: "#ff6b6b",
    position: "relative",
  },
  popularBadge: {
    position: "absolute",
    top: -12,
    alignSelf: "center",
    backgroundColor: "#ff6b6b",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: "#ff6b6b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  popularText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  planName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2d3748",
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 24,
  },
  price: {
    fontSize: 40,
    fontWeight: "800",
    color: "#ff6b6b",
  },
  priceUnit: {
    fontSize: 16,
    color: "#718096",
    marginLeft: 4,
  },
  featuresList: {
    gap: 12,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    color: "#4a5568",
  },
  planButton: {
    backgroundColor: "#f7fafc",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  planButtonText: {
    color: "#2d3748",
    fontSize: 16,
    fontWeight: "600",
  },
  planButtonPrimary: {
    backgroundColor: "#ff6b6b",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#ff6b6b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  planButtonPrimaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  faqContainer: {
    gap: 12,
  },
  faqItem: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d3748",
    flex: 1,
  },
  faqAnswer: {
    fontSize: 14,
    color: "#718096",
    marginTop: 12,
    lineHeight: 20,
  },
  footerCTA: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  footerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  footerButton: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  footerButtonText: {
    color: "#ff6b6b",
    fontSize: 18,
    fontWeight: "700",
  },
  footer: {
    paddingVertical: 24,
    alignItems: "center",
    backgroundColor: "#2d3748",
  },
  footerText: {
    fontSize: 12,
    color: "#a0aec0",
  },
});
