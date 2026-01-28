/**
 * LiquidTabs - iOS 26 Liquid Glass Style Tabs Component
 * 
 * Cross-platform (iOS, Android, Web) tabs with frosted glass effect,
 * animated sliding indicator, and full accessibility support.
 */

import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ComponentProps,
    type ReactNode,
} from 'react';
import {
    AccessibilityRole,
    LayoutChangeEvent,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useColorScheme,
    View,
    type ViewStyle
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useReducedMotion,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';

// ============================================================================
// Design Tokens
// ============================================================================

const TOKENS = {
  light: {
    // Glass base
    glassBackground: 'rgba(255, 255, 255, 0.18)',
    glassBorder: 'rgba(255, 255, 255, 0.35)',
    glassHighlight: 'rgba(255, 255, 255, 0.5)',
    glassShadow: 'rgba(0, 0, 0, 0.08)',
    
    // Indicator (active pill)
    indicatorBackground: 'rgba(255, 255, 255, 0.45)',
    indicatorBorder: 'rgba(255, 255, 255, 0.6)',
    indicatorShadow: 'rgba(0, 0, 0, 0.12)',
    
    // Text
    textActive: 'rgba(0, 0, 0, 0.9)',
    textInactive: 'rgba(0, 0, 0, 0.55)',
    textDisabled: 'rgba(0, 0, 0, 0.25)',
    
    // Specular highlights
    specularStart: 'rgba(255, 255, 255, 0.7)',
    specularEnd: 'rgba(255, 255, 255, 0)',
    
    // Inner glow
    innerGlowStart: 'rgba(255, 255, 255, 0.3)',
    innerGlowEnd: 'rgba(255, 255, 255, 0)',
  },
  dark: {
    // Glass base
    glassBackground: 'rgba(255, 255, 255, 0.08)',
    glassBorder: 'rgba(255, 255, 255, 0.15)',
    glassHighlight: 'rgba(255, 255, 255, 0.2)',
    glassShadow: 'rgba(0, 0, 0, 0.4)',
    
    // Indicator (active pill)
    indicatorBackground: 'rgba(255, 255, 255, 0.15)',
    indicatorBorder: 'rgba(255, 255, 255, 0.25)',
    indicatorShadow: 'rgba(0, 0, 0, 0.5)',
    
    // Text
    textActive: 'rgba(255, 255, 255, 0.95)',
    textInactive: 'rgba(255, 255, 255, 0.55)',
    textDisabled: 'rgba(255, 255, 255, 0.25)',
    
    // Specular highlights
    specularStart: 'rgba(255, 255, 255, 0.25)',
    specularEnd: 'rgba(255, 255, 255, 0)',
    
    // Inner glow
    innerGlowStart: 'rgba(255, 255, 255, 0.1)',
    innerGlowEnd: 'rgba(255, 255, 255, 0)',
  },
} as const;

const DIMENSIONS = {
  minHeight: 48,
  borderRadius: 999, // Pill shape
  indicatorPadding: 4,
  tabPaddingHorizontal: 16,
  tabPaddingVertical: 10,
  blurIntensity: 40,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
} as const;

const ANIMATION = {
  spring: {
    damping: 20,
    stiffness: 300,
    mass: 0.8,
  },
  springReduced: {
    damping: 30,
    stiffness: 400,
    mass: 1,
  },
  timing: {
    duration: 200,
  },
  timingReduced: {
    duration: 100,
  },
} as const;

// ============================================================================
// Types
// ============================================================================

type Variant = 'light' | 'dark' | 'auto';
type TokenSet = typeof TOKENS.light | typeof TOKENS.dark;

interface TabLayout {
  x: number;
  width: number;
}

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
  variant: Variant;
  tokens: TokenSet;
  registerTab: (value: string, layout: TabLayout) => void;
  tabLayouts: Map<string, TabLayout>;
  reducedMotion: boolean;
}

interface LiquidTabsProps {
  children: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  variant?: Variant;
}

interface LiquidTabsListProps {
  children: ReactNode;
  style?: ViewStyle;
}

interface LiquidTabsTriggerProps {
  value: string;
  label?: string;
  children?: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
}

interface LiquidTabsContentProps {
  value: string;
  children: ReactNode;
  style?: ViewStyle;
}

// ============================================================================
// Context
// ============================================================================

const TabsContext = createContext<TabsContextValue | null>(null);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within LiquidTabs');
  }
  return context;
};

// ============================================================================
// Web-specific Blur Component
// ============================================================================

const WebGlassBackground: React.FC<{
  tokens: TokenSet;
  style?: ViewStyle;
  children?: ReactNode;
}> = ({ tokens, style, children }) => {
  // On web, use CSS backdrop-filter for real blur
  const webStyle = Platform.select({
    web: {
      // @ts-ignore - web-specific CSS property
      backdropFilter: 'blur(40px)',
      WebkitBackdropFilter: 'blur(40px)',
    } as ViewStyle,
    default: {},
  });

  return (
    <View
      style={[
        {
          backgroundColor: tokens.glassBackground,
          borderRadius: DIMENSIONS.borderRadius,
          overflow: 'hidden',
        },
        webStyle,
        style,
      ]}
    >
      {children}
    </View>
  );
};

// ============================================================================
// Glass Background Component (Platform-aware)
// ============================================================================

const GlassBackground: React.FC<{
  tokens: TokenSet;
  variant: Variant;
  children?: ReactNode;
}> = ({ tokens, variant, children }) => {
  const blurTint = variant === 'dark' ? 'dark' : 'light';

  if (Platform.OS === 'web') {
    return (
      <WebGlassBackground tokens={tokens}>
        {/* Specular highlight gradient */}
        <LinearGradient
          colors={[tokens.specularStart, tokens.specularEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        {/* Inner glow */}
        <LinearGradient
          colors={[tokens.innerGlowStart, tokens.innerGlowEnd]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.5 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        {children}
      </WebGlassBackground>
    );
  }

  // iOS/Android: Use BlurView
  return (
    <View style={styles.glassContainer}>
      <BlurView
        intensity={DIMENSIONS.blurIntensity}
        tint={blurTint}
        style={StyleSheet.absoluteFill}
      />
      {/* Fallback background for when blur isn't fully supported */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: tokens.glassBackground },
        ]}
        pointerEvents="none"
      />
      {/* Specular highlight gradient */}
      <LinearGradient
        colors={[tokens.specularStart, tokens.specularEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {/* Inner glow */}
      <LinearGradient
        colors={[tokens.innerGlowStart, tokens.innerGlowEnd]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {children}
    </View>
  );
};

// ============================================================================
// Animated Indicator (Glass Pill)
// ============================================================================

const AnimatedIndicator: React.FC<{
  tokens: TokenSet;
  variant: Variant;
  tabLayouts: Map<string, TabLayout>;
  activeValue: string;
  reducedMotion: boolean;
}> = ({ tokens, variant, tabLayouts, activeValue, reducedMotion }) => {
  const translateX = useSharedValue(0);
  const width = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const layout = tabLayouts.get(activeValue);
    if (layout) {
      const springConfig = reducedMotion
        ? ANIMATION.springReduced
        : ANIMATION.spring;

      translateX.value = withSpring(
        layout.x - DIMENSIONS.indicatorPadding,
        springConfig
      );
      width.value = withSpring(
        layout.width + DIMENSIONS.indicatorPadding * 2,
        springConfig
      );
      opacity.value = withTiming(1, { duration: 150 });
    }
  }, [activeValue, tabLayouts, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scaleY: scale.value },
    ],
    width: width.value,
    opacity: opacity.value,
  }));

  const blurTint = variant === 'dark' ? 'dark' : 'light';

  return (
    <Animated.View
      style={[
        styles.indicator,
        {
          backgroundColor: tokens.indicatorBackground,
          borderColor: tokens.indicatorBorder,
          shadowColor: tokens.indicatorShadow,
        },
        animatedStyle,
      ]}
      pointerEvents="none"
    >
      {Platform.OS !== 'web' && (
        <BlurView
          intensity={30}
          tint={blurTint}
          style={StyleSheet.absoluteFill}
        />
      )}
      {/* Indicator specular highlight */}
      <LinearGradient
        colors={[tokens.specularStart, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { opacity: 0.5 }]}
        pointerEvents="none"
      />
    </Animated.View>
  );
};

// ============================================================================
// LiquidTabs (Root)
// ============================================================================

export const LiquidTabs: React.FC<LiquidTabsProps> = ({
  children,
  value: controlledValue,
  defaultValue = '',
  onValueChange,
  variant = 'auto',
}) => {
  const systemColorScheme = useColorScheme();
  const reducedMotion = useReducedMotion();
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const [tabLayouts] = useState(() => new Map<string, TabLayout>());

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const resolvedVariant = useMemo(() => {
    if (variant === 'auto') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return variant;
  }, [variant, systemColorScheme]);

  const tokens = TOKENS[resolvedVariant];

  const handleValueChange = useCallback(
    (newValue: string) => {
      if (!isControlled) {
        setUncontrolledValue(newValue);
      }
      onValueChange?.(newValue);
    },
    [isControlled, onValueChange]
  );

  const registerTab = useCallback(
    (tabValue: string, layout: TabLayout) => {
      tabLayouts.set(tabValue, layout);
    },
    [tabLayouts]
  );

  const contextValue = useMemo<TabsContextValue>(
    () => ({
      value,
      onValueChange: handleValueChange,
      variant: resolvedVariant,
      tokens,
      registerTab,
      tabLayouts,
      reducedMotion: reducedMotion ?? false,
    }),
    [value, handleValueChange, resolvedVariant, tokens, registerTab, tabLayouts, reducedMotion]
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <View style={styles.root}>{children}</View>
    </TabsContext.Provider>
  );
};

// ============================================================================
// LiquidTabsList
// ============================================================================

export const LiquidTabsList: React.FC<LiquidTabsListProps> = ({
  children,
  style,
}) => {
  const { tokens, variant, tabLayouts, value, reducedMotion } = useTabsContext();
  const scrollViewRef = useRef<ScrollView>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [layoutsReady, setLayoutsReady] = useState(false);

  const needsScroll = contentWidth > containerWidth;

  const handleContainerLayout = useCallback((e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  }, []);

  const handleContentLayout = useCallback((e: LayoutChangeEvent) => {
    setContentWidth(e.nativeEvent.layout.width);
    // Small delay to ensure all tab layouts are registered
    setTimeout(() => setLayoutsReady(true), 50);
  }, []);

  // Web-specific: Add keyboard navigation
  const handleKeyDown = useCallback(
    (e: any) => {
      if (Platform.OS !== 'web') return;
      
      const tabs = Array.from(tabLayouts.keys());
      const currentIndex = tabs.indexOf(value);
      
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const direction = e.key === 'ArrowRight' ? 1 : -1;
        const nextIndex = Math.max(0, Math.min(tabs.length - 1, currentIndex + direction));
        if (tabs[nextIndex]) {
          // Focus the next tab trigger
          const nextTab = document.querySelector(`[data-tab-value="${tabs[nextIndex]}"]`);
          (nextTab as HTMLElement)?.focus();
        }
      }
    },
    [tabLayouts, value]
  );

  const webProps = Platform.OS === 'web' ? {
    role: 'tablist' as const,
    onKeyDown: handleKeyDown,
  } : {};

  return (
    <View
      style={[
        styles.listContainer,
        {
          borderColor: tokens.glassBorder,
          shadowColor: tokens.glassShadow,
        },
        style,
      ]}
      onLayout={handleContainerLayout}
      {...webProps}
    >
      <GlassBackground tokens={tokens} variant={variant}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={needsScroll}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={(w) => setContentWidth(w)}
        >
          <View style={styles.tabsRow} onLayout={handleContentLayout}>
            {/* Animated indicator behind tabs */}
            {layoutsReady && tabLayouts.size > 0 && (
              <AnimatedIndicator
                tokens={tokens}
                variant={variant}
                tabLayouts={tabLayouts}
                activeValue={value}
                reducedMotion={reducedMotion}
              />
            )}
            {children}
          </View>
        </ScrollView>
      </GlassBackground>
      
      {/* Fade edges when scrollable */}
      {needsScroll && (
        <>
          <LinearGradient
            colors={['rgba(0,0,0,0.15)', 'transparent']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.fadeLeft}
            pointerEvents="none"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.15)']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.fadeRight}
            pointerEvents="none"
          />
        </>
      )}
    </View>
  );
};

// ============================================================================
// LiquidTabsTrigger
// ============================================================================

export const LiquidTabsTrigger: React.FC<LiquidTabsTriggerProps> = ({
  value: tabValue,
  label,
  children,
  disabled = false,
  icon,
}) => {
  const {
    value,
    onValueChange,
    tokens,
    registerTab,
    reducedMotion,
  } = useTabsContext();

  const isActive = value === tabValue;
  const pressScale = useSharedValue(1);
  const hoverOpacity = useSharedValue(0);

  const handleLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const { x, width } = e.nativeEvent.layout;
      registerTab(tabValue, { x, width });
    },
    [tabValue, registerTab]
  );

  const handlePress = useCallback(() => {
    if (!disabled) {
      onValueChange(tabValue);
    }
  }, [disabled, onValueChange, tabValue]);

  const handlePressIn = useCallback(() => {
    if (!disabled) {
      const config = reducedMotion ? ANIMATION.timingReduced : ANIMATION.timing;
      pressScale.value = withTiming(0.96, config);
    }
  }, [disabled, reducedMotion]);

  const handlePressOut = useCallback(() => {
    const config = reducedMotion ? ANIMATION.timingReduced : ANIMATION.timing;
    pressScale.value = withTiming(1, config);
  }, [reducedMotion]);

  const handleHoverIn = useCallback(() => {
    if (!disabled && Platform.OS === 'web') {
      hoverOpacity.value = withTiming(1, { duration: 150 });
    }
  }, [disabled]);

  const handleHoverOut = useCallback(() => {
    if (Platform.OS === 'web') {
      hoverOpacity.value = withTiming(0, { duration: 150 });
    }
  }, []);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const animatedHoverStyle = useAnimatedStyle(() => ({
    opacity: hoverOpacity.value,
  }));

  const textColor = disabled
    ? tokens.textDisabled
    : isActive
    ? tokens.textActive
    : tokens.textInactive;

  // Accessibility props
  const accessibilityProps: ComponentProps<typeof Pressable> = {
    accessibilityRole: 'tab' as AccessibilityRole,
    accessibilityState: {
      selected: isActive,
      disabled,
    },
    accessibilityLabel: label || (typeof children === 'string' ? children : undefined),
  };

  // Web-specific props for ARIA
  const webProps = Platform.OS === 'web' ? {
    // @ts-ignore - web-specific
    'data-tab-value': tabValue,
    'aria-selected': isActive,
    'aria-disabled': disabled,
    tabIndex: (isActive ? 0 : -1) as 0 | -1,
  } : {};

  return (
    <Animated.View style={animatedContainerStyle} onLayout={handleLayout}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onHoverIn={handleHoverIn}
        onHoverOut={handleHoverOut}
        disabled={disabled}
        style={styles.trigger}
        {...accessibilityProps}
        {...webProps}
      >
        {/* Hover highlight (web only) */}
        {Platform.OS === 'web' && !isActive && (
          <Animated.View
            style={[
              styles.hoverHighlight,
              { backgroundColor: tokens.glassHighlight },
              animatedHoverStyle,
            ]}
            pointerEvents="none"
          />
        )}
        
        <View style={styles.triggerContent}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          {(label || children) && (
            <Text
              style={[
                styles.triggerText,
                { color: textColor },
                isActive && styles.triggerTextActive,
              ]}
              numberOfLines={1}
            >
              {label || children}
            </Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
};

// ============================================================================
// LiquidTabsContent
// ============================================================================

export const LiquidTabsContent: React.FC<LiquidTabsContentProps> = ({
  value: tabValue,
  children,
  style,
}) => {
  const { value, reducedMotion } = useTabsContext();
  const isActive = value === tabValue;
  const opacity = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    const config = reducedMotion ? { duration: 100 } : { duration: 200 };
    opacity.value = withTiming(isActive ? 1 : 0, config);
  }, [isActive, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    display: opacity.value === 0 ? 'none' : 'flex',
  }));

  // Web accessibility
  const webProps = Platform.OS === 'web' ? {
    role: 'tabpanel' as const,
    'aria-hidden': !isActive,
  } : {};

  return (
    <Animated.View
      style={[styles.content, style, animatedStyle]}
      accessibilityRole="summary"
      accessibilityState={{ expanded: isActive }}
      {...webProps}
    >
      {children}
    </Animated.View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  root: {
    width: '100%',
  },
  glassContainer: {
    borderRadius: DIMENSIONS.borderRadius,
    overflow: 'hidden',
  },
  listContainer: {
    minHeight: DIMENSIONS.minHeight,
    borderRadius: DIMENSIONS.borderRadius,
    borderWidth: 1,
    overflow: 'hidden',
    // Shadow
    shadowOffset: DIMENSIONS.shadowOffset,
    shadowOpacity: 1,
    shadowRadius: DIMENSIONS.shadowRadius,
    elevation: 8,
  },
  listContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DIMENSIONS.indicatorPadding,
    paddingVertical: DIMENSIONS.indicatorPadding,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: DIMENSIONS.indicatorPadding,
    bottom: DIMENSIONS.indicatorPadding,
    borderRadius: DIMENSIONS.borderRadius,
    borderWidth: 1,
    overflow: 'hidden',
    // Shadow for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  trigger: {
    paddingHorizontal: DIMENSIONS.tabPaddingHorizontal,
    paddingVertical: DIMENSIONS.tabPaddingVertical,
    borderRadius: DIMENSIONS.borderRadius,
    position: 'relative',
    overflow: 'hidden',
  },
  triggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  triggerText: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  triggerTextActive: {
    fontWeight: '600',
  },
  iconContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hoverHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: DIMENSIONS.borderRadius,
  },
  content: {
    flex: 1,
  },
  fadeLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 20,
    borderTopLeftRadius: DIMENSIONS.borderRadius,
    borderBottomLeftRadius: DIMENSIONS.borderRadius,
  },
  fadeRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 20,
    borderTopRightRadius: DIMENSIONS.borderRadius,
    borderBottomRightRadius: DIMENSIONS.borderRadius,
  },
});

// ============================================================================
// Exports
// ============================================================================

export default {
  Root: LiquidTabs,
  List: LiquidTabsList,
  Trigger: LiquidTabsTrigger,
  Content: LiquidTabsContent,
};
