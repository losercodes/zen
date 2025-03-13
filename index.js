/**
 * ZenUI.js
 * A lightweight (~20KB) JavaScript UI framework focused on minimalistic design
 * v1.0.0
 */

const ZenUI = (() => {
    // --- CORE RENDERING ENGINE ---
    
    // Theme configuration
    const defaultTheme = {
      colors: {
        primary: '#4a6cf7',
        secondary: '#6c757d',
        success: '#28a745',
        danger: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8',
        light: '#f8f9fa',
        dark: '#343a40',
        background: '#ffffff',
        text: '#212529',
        border: '#dee2e6',
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
      },
      typography: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        fontSize: '16px',
        lineHeight: 1.5,
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        pill: '50rem',
      },
      shadows: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
      },
      transitions: {
        default: 'all 0.2s ease-in-out',
        fast: 'all 0.1s ease-in-out',
        slow: 'all 0.3s ease-in-out',
      }
    };
  
    // Current active theme
    let activeTheme = { ...defaultTheme };
  
    // CSS-in-JS implementation
    let styleSheet = null;
    const styleCache = new Map();
    let uniqueId = 0;
  
    const initStyles = () => {
      if (!styleSheet) {
        const style = document.createElement('style');
        style.id = 'zen-ui-styles';
        document.head.appendChild(style);
        styleSheet = style.sheet;
      }
    };
  
    const createUniqueId = (prefix = 'zen') => {
      return `${prefix}-${uniqueId++}`;
    };
  
    const css = (styles) => {
      initStyles();
      
      const processedStyles = typeof styles === 'function' 
        ? styles(activeTheme) 
        : styles;
        
      const cssString = Object.entries(processedStyles)
        .map(([key, value]) => {
          // Handle nested selectors
          if (typeof value === 'object') {
            const nestedRules = Object.entries(value)
              .map(([nestedKey, nestedValue]) => `${nestedKey}: ${nestedValue};`)
              .join(' ');
            return `${key} { ${nestedRules} }`;
          }
          return `${key}: ${value};`;
        })
        .join(' ');
      
      const hash = btoa(cssString).replace(/[+/=]/g, '').substring(0, 8);
      
      if (!styleCache.has(hash)) {
        const className = createUniqueId('zen-style');
        styleCache.set(hash, className);
        
        const rule = `.${className} { ${cssString} }`;
        styleSheet.insertRule(rule, styleSheet.cssRules.length);
      }
      
      return styleCache.get(hash);
    };
  
    // Utility to merge class names
    const mergeClasses = (...classes) => {
      return classes.filter(Boolean).join(' ');
    };
  
    // Create DOM element with properties, styles, and events
    const createElement = (tag, props = {}) => {
      const element = document.createElement(tag);
      
      const { 
        className, 
        style, 
        children, 
        dataset,
        cssStyles,
        ...rest
      } = props;
      
      // Apply CSS-in-JS styles if provided
      if (cssStyles) {
        const generatedClass = css(cssStyles);
        element.classList.add(generatedClass);
      }
      
      // Apply regular classes
      if (className) {
        if (Array.isArray(className)) {
          element.className = className.filter(Boolean).join(' ');
        } else {
          element.className = className;
        }
      }
      
      // Apply inline styles
      if (style) {
        Object.assign(element.style, style);
      }
      
      // Apply data attributes
      if (dataset) {
        Object.entries(dataset).forEach(([key, value]) => {
          element.dataset[key] = value;
        });
      }
      
      // Apply other properties and event handlers
      Object.entries(rest).forEach(([key, value]) => {
        if (key.startsWith('on') && typeof value === 'function') {
          // Event handler
          const eventName = key.substring(2).toLowerCase();
          element.addEventListener(eventName, value);
        } else if (key === 'ref' && typeof value === 'function') {
          // Handle ref callback
          value(element);
        } else {
          // Other property
          element[key] = value;
        }
      });
      
      // Append children
      if (children) {
        if (Array.isArray(children)) {
          children.forEach((child) => {
            if (child) {
              element.appendChild(
                typeof child === 'string' ? document.createTextNode(child) : child
              );
            }
          });
        } else if (typeof children === 'string') {
          element.textContent = children;
        } else {
          element.appendChild(children);
        }
      }
      
      return element;
    };
  
    // Animation utility
    const animate = (element, keyframes, options) => {
      if (!element || !keyframes) return null;
      
      const animation = element.animate(keyframes, {
        duration: 200,
        easing: 'ease-in-out',
        fill: 'forwards',
        ...options,
      });
      
      return animation;
    };
  
    // --- COMPONENT FACTORY ---
    
    const createComponent = (renderFn) => {
      return (props = {}) => renderFn(props);
    };
  
    // --- PREBUILT COMPONENTS ---
    
    // Button Component
    const Button = createComponent((props) => {
      const {
        label,
        type = 'default',
        size = 'medium',
        onClick,
        disabled = false,
        full = false,
        outline = false,
        icon = null,
        ...rest
      } = props;
      
      const getTypeStyles = (theme) => {
        const baseStyles = {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          border: 'none',
          borderRadius: theme.borderRadius.md,
          fontFamily: theme.typography.fontFamily,
          fontWeight: '500',
          cursor: 'pointer',
          transition: theme.transitions.default,
        };
        
        // Size variations
        const sizeMap = {
          small: {
            padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
            fontSize: '0.875rem',
          },
          medium: {
            padding: `${theme.spacing.sm} ${theme.spacing.md}`,
            fontSize: '1rem',
          },
          large: {
            padding: `${theme.spacing.md} ${theme.spacing.lg}`,
            fontSize: '1.125rem',
          },
        };
        
        // Type variations
        const typeStyles = {
          default: {
            backgroundColor: theme.colors.light,
            color: theme.colors.dark,
            '&:hover': {
              backgroundColor: '#e2e6ea',
            },
          },
          primary: {
            backgroundColor: theme.colors.primary,
            color: 'white',
            '&:hover': {
              backgroundColor: '#3a59c7',
            },
          },
          secondary: {
            backgroundColor: theme.colors.secondary,
            color: 'white',
            '&:hover': {
              backgroundColor: '#5a6268',
            },
          },
          success: {
            backgroundColor: theme.colors.success,
            color: 'white',
            '&:hover': {
              backgroundColor: '#218838',
            },
          },
          danger: {
            backgroundColor: theme.colors.danger,
            color: 'white',
            '&:hover': {
              backgroundColor: '#c82333',
            },
          },
        };
        
        const outlineStyles = outline ? {
          backgroundColor: 'transparent',
          border: `1px solid ${theme.colors[type]}`,
          color: theme.colors[type],
          '&:hover': {
            backgroundColor: theme.colors[type],
            color: 'white',
          },
        } : {};
        
        const widthStyles = full ? { width: '100%' } : {};
        const disabledStyles = disabled ? {
          opacity: '0.65',
          cursor: 'not-allowed',
          '&:hover': {
            backgroundColor: theme.colors[type],
          },
        } : {};
        
        return {
          ...baseStyles,
          ...sizeMap[size],
          ...typeStyles[type],
          ...outlineStyles,
          ...widthStyles,
          ...disabledStyles,
        };
      };
      
      return createElement('button', {
        cssStyles: getTypeStyles,
        disabled,
        onClick,
        children: [
          icon,
          label
        ],
        ...rest,
      });
    });
  
    // Card Component
    const Card = createComponent((props) => {
      const {
        title,
        content,
        footer,
        elevated = false,
        children,
        ...rest
      } = props;
      
      const cardStyles = (theme) => ({
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.colors.background,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.borderRadius.md,
        overflow: 'hidden',
        boxShadow: elevated ? theme.shadows.md : 'none',
        transition: theme.transitions.default,
        '&:hover': elevated ? {
          boxShadow: theme.shadows.lg,
          transform: 'translateY(-2px)'
        } : {},
      });
      
      const cardHeaderStyles = (theme) => ({
        padding: theme.spacing.md,
        borderBottom: title ? `1px solid ${theme.colors.border}` : 'none',
        fontWeight: 'bold',
      });
      
      const cardContentStyles = (theme) => ({
        padding: theme.spacing.md,
        flex: '1 1 auto',
      });
      
      const cardFooterStyles = (theme) => ({
        padding: theme.spacing.md,
        borderTop: `1px solid ${theme.colors.border}`,
        backgroundColor: theme.colors.light,
      });
      
      const cardHeader = title ? createElement('div', {
        cssStyles: cardHeaderStyles,
        children: title,
      }) : null;
      
      const cardContent = createElement('div', {
        cssStyles: cardContentStyles,
        children: content || children,
      });
      
      const cardFooter = footer ? createElement('div', {
        cssStyles: cardFooterStyles,
        children: footer,
      }) : null;
      
      return createElement('div', {
        cssStyles: cardStyles,
        children: [
          cardHeader,
          cardContent,
          cardFooter
        ].filter(Boolean),
        ...rest,
      });
    });
  
    // Input Component
    const Input = createComponent((props) => {
      const {
        type = 'text',
        placeholder,
        value = '',
        onChange,
        label,
        error,
        success,
        disabled = false,
        ...rest
      } = props;
      
      const inputWrapperStyles = (theme) => ({
        display: 'flex',
        flexDirection: 'column',
        marginBottom: theme.spacing.md,
      });
      
      const labelStyles = (theme) => ({
        marginBottom: theme.spacing.xs,
        fontSize: '0.875rem',
        fontWeight: '500',
      });
      
      const getInputStyles = (theme) => {
        const baseStyles = {
          display: 'block',
          width: '100%',
          padding: `${theme.spacing.sm} ${theme.spacing.md}`,
          fontSize: '1rem',
          lineHeight: '1.5',
          color: theme.colors.text,
          backgroundColor: theme.colors.background,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.borderRadius.md,
          transition: theme.transitions.default,
          '&:focus': {
            outline: 'none',
            borderColor: theme.colors.primary,
            boxShadow: `0 0 0 0.2rem rgba(74, 108, 247, 0.25)`,
          },
        };
        
        const stateStyles = {};
        
        if (error) {
          stateStyles.borderColor = theme.colors.danger;
          stateStyles['&:focus'] = {
            boxShadow: `0 0 0 0.2rem rgba(220, 53, 69, 0.25)`,
          };
        } else if (success) {
          stateStyles.borderColor = theme.colors.success;
          stateStyles['&:focus'] = {
            boxShadow: `0 0 0 0.2rem rgba(40, 167, 69, 0.25)`,
          };
        }
        
        if (disabled) {
          stateStyles.backgroundColor = theme.colors.light;
          stateStyles.opacity = '0.65';
          stateStyles.cursor = 'not-allowed';
        }
        
        return {
          ...baseStyles,
          ...stateStyles,
        };
      };
      
      const feedbackStyles = (theme) => ({
        marginTop: theme.spacing.xs,
        fontSize: '0.875rem',
        color: error ? theme.colors.danger : 
               success ? theme.colors.success : 'transparent',
      });
      
      const labelElement = label ? createElement('label', {
        cssStyles: labelStyles,
        children: label,
      }) : null;
      
      const inputElement = createElement('input', {
        type,
        value,
        placeholder,
        disabled,
        onChange,
        cssStyles: getInputStyles,
        ...rest
      });
      
      const feedbackElement = (error || success) ? createElement('div', {
        cssStyles: feedbackStyles,
        children: error || success || '',
      }) : null;
      
      return createElement('div', {
        cssStyles: inputWrapperStyles,
        children: [
          labelElement,
          inputElement,
          feedbackElement
        ].filter(Boolean),
      });
    });
  
    // Form Component
    const Form = createComponent((props) => {
      const {
        onSubmit,
        children,
        ...rest
      } = props;
      
      const formStyles = (theme) => ({
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
      });
      
      const handleSubmit = (e) => {
        e.preventDefault();
        if (onSubmit) onSubmit(e);
      };
      
      return createElement('form', {
        cssStyles: formStyles,
        onSubmit: handleSubmit,
        children,
        ...rest,
      });
    });
  
    // Modal Component
    const Modal = createComponent((props) => {
      const {
        title,
        content,
        footer,
        isOpen = false,
        onClose,
        size = 'medium',
        children,
        ...rest
      } = props;
      
      if (!isOpen) return null;
      
      const overlayStyles = (theme) => ({
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '1000',
      });
      
      const getModalStyles = (theme) => {
        const baseStyles = {
          backgroundColor: theme.colors.background,
          borderRadius: theme.borderRadius.md,
          boxShadow: theme.shadows.lg,
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          overflow: 'hidden',
          position: 'relative',
          zIndex: '1001',
        };
        
        const sizeMap = {
          small: {
            width: '300px',
          },
          medium: {
            width: '500px',
          },
          large: {
            width: '800px',
          },
          fullscreen: {
            width: '95vw',
            height: '95vh',
          },
        };
        
        return {
          ...baseStyles,
          ...sizeMap[size],
        };
      };
      
      const modalHeaderStyles = (theme) => ({
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.md,
        borderBottom: `1px solid ${theme.colors.border}`,
      });
      
      const modalTitleStyles = () => ({
        margin: '0',
        fontWeight: 'bold',
        fontSize: '1.25rem',
      });
      
      const closeButtonStyles = (theme) => ({
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1.5rem',
        lineHeight: '1',
        padding: '0',
        color: theme.colors.secondary,
        '&:hover': {
          color: theme.colors.dark,
        },
      });
      
      const modalContentStyles = (theme) => ({
        flex: '1 1 auto',
        padding: theme.spacing.md,
        overflowY: 'auto',
      });
      
      const modalFooterStyles = (theme) => ({
        padding: theme.spacing.md,
        borderTop: `1px solid ${theme.colors.border}`,
        display: 'flex',
        justifyContent: 'flex-end',
        gap: theme.spacing.sm,
      });
      
      // Creating elements
      const closeButton = createElement('button', {
        cssStyles: closeButtonStyles,
        onClick: onClose,
        children: '×',
        ariaLabel: 'Close',
      });
      
      const modalTitle = createElement('h3', {
        cssStyles: modalTitleStyles,
        children: title,
      });
      
      const modalHeader = title ? createElement('div', {
        cssStyles: modalHeaderStyles,
        children: [
          modalTitle,
          closeButton
        ],
      }) : null;
      
      const modalContent = createElement('div', {
        cssStyles: modalContentStyles,
        children: content || children,
      });
      
      const modalFooter = footer ? createElement('div', {
        cssStyles: modalFooterStyles,
        children: footer,
      }) : null;
      
      const modalElement = createElement('div', {
        cssStyles: getModalStyles,
        children: [
          modalHeader,
          modalContent,
          modalFooter
        ].filter(Boolean),
        ...rest,
      });
      
      const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      };
      
      const overlay = createElement('div', {
        cssStyles: overlayStyles,
        onClick: handleOverlayClick,
        children: modalElement,
      });
      
      // Add to body and setup animation
      document.body.appendChild(overlay);
      
      // Fade in animation
      animate(overlay, [
        { opacity: 0 },
        { opacity: 1 }
      ], { duration: 200 });
      
      animate(modalElement, [
        { transform: 'scale(0.9)', opacity: 0 },
        { transform: 'scale(1)', opacity: 1 }
      ], { duration: 200 });
      
      // Setup cleanup
      const cleanup = () => {
        if (overlay.parentNode) {
          // Fade out animation
          const overlayAnim = animate(overlay, [
            { opacity: 1 },
            { opacity: 0 }
          ], { duration: 200 });
          
          const modalAnim = animate(modalElement, [
            { transform: 'scale(1)', opacity: 1 },
            { transform: 'scale(0.9)', opacity: 0 }
          ], { duration: 200 });
          
          overlayAnim.onfinish = () => {
            if (overlay.parentNode) {
              overlay.parentNode.removeChild(overlay);
            }
          };
        }
      };
      
      // Expose cleanup method
      modalElement.cleanup = cleanup;
      
      // Cleanup when close button is clicked
      closeButton.addEventListener('click', cleanup);
      
      return modalElement;
    });
    
    // --- UTILITY FUNCTIONS ---
    
    // Set custom theme
    const setTheme = (newTheme) => {
      activeTheme = {
        ...activeTheme,
        ...newTheme,
        colors: {
          ...activeTheme.colors,
          ...(newTheme.colors || {}),
        },
        spacing: {
          ...activeTheme.spacing,
          ...(newTheme.spacing || {}),
        },
        typography: {
          ...activeTheme.typography,
          ...(newTheme.typography || {}),
        },
        borderRadius: {
          ...activeTheme.borderRadius,
          ...(newTheme.borderRadius || {}),
        },
        shadows: {
          ...activeTheme.shadows,
          ...(newTheme.shadows || {}),
        },
        transitions: {
          ...activeTheme.transitions,
          ...(newTheme.transitions || {}),
        },
      };
      
      // Clear style cache when theme changes
      styleCache.clear();
      return activeTheme;
    };
    
    // Get current theme
    const getTheme = () => {
      return { ...activeTheme };
    };
    
    // Reset theme to default
    const resetTheme = () => {
      activeTheme = { ...defaultTheme };
      styleCache.clear();
      return activeTheme;
    };
    
    // --- PUBLIC API ---
    
    // Initialize styles
    initStyles();
  
    // Return public API
    return {
      // Core elements
      createElement,
      css,
      animate,
      
      // Components
      Button,
      Card,
      Input,
      Form,
      Modal,
      
      // Theme utilities
      setTheme,
      getTheme,
      resetTheme,
      
      // Helper utilities
      mergeClasses,
    };
  })();
  
  // For CommonJS compatibility
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ZenUI;
  }
  
  // For ES6 modules compatibility
  if (typeof exports !== 'undefined') {
    exports.default = ZenUI;
  }