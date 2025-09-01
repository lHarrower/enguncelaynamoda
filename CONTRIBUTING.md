# Contributing to AYNAMODA 🤝

We're thrilled that you're interested in contributing to AYNAMODA! This document provides guidelines and information for contributors.

## 🌟 Ways to Contribute

- **Bug Reports**: Help us identify and fix issues
- **Feature Requests**: Suggest new features or improvements
- **Code Contributions**: Submit bug fixes, new features, or improvements
- **Documentation**: Improve or add to our documentation
- **Design**: Contribute UI/UX improvements
- **Testing**: Help test new features and report issues
- **Translations**: Help make AYNAMODA accessible in more languages

## 🚀 Getting Started

### Prerequisites

- Node.js (v18.0.0 or higher)
- npm or yarn
- Git
- Expo CLI
- A Supabase account (for backend features)

### Setting Up Your Development Environment

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/aynamoda.git
   cd aynamoda
   ```

2. **Add the upstream remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/aynamoda.git
   ```

3. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Start the development server**
   ```bash
   npm start
   ```

## 📋 Development Workflow

### Branch Naming Convention

- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `hotfix/description` - Critical fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test additions/updates

Examples:
- `feature/ai-outfit-suggestions`
- `bugfix/wardrobe-image-upload`
- `docs/setup-instructions`

### Making Changes

1. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow our coding standards (see below)
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   npm test
   npm run lint
   npm run type-check
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add AI outfit suggestions feature"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Go to GitHub and create a PR from your fork
   - Fill out the PR template completely
   - Link any related issues

## 📝 Coding Standards

### Code Style

- **JavaScript/TypeScript**: We use ESLint and Prettier
- **React Native**: Follow React Native best practices
- **File Naming**: Use camelCase for files, PascalCase for components
- **Component Structure**: Use functional components with hooks

### Code Organization

```
src/
├── components/
│   ├── common/          # Reusable components
│   ├── wardrobe/        # Wardrobe-specific components
│   └── [feature]/       # Feature-specific components
├── screens/
│   └── [ScreenName]/    # Screen components
├── services/            # API and business logic
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
├── styles/              # Theme and styling
└── types/               # TypeScript type definitions
```

### Component Guidelines

```typescript
// Good component structure
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface Props {
  title: string;
  onPress?: () => void;
}

export const MyComponent: React.FC<Props> = ({ title, onPress }) => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {title}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
```

### Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(wardrobe): add image upload functionality
fix(auth): resolve login redirect issue
docs(readme): update installation instructions
refactor(components): extract common button component
```

## 🧪 Testing Guidelines

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Writing Tests

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user workflows

```typescript
// Example component test
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    const { getByText } = render(<MyComponent title="Test" />);
    expect(getByText('Test')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <MyComponent title="Test" onPress={mockOnPress} />
    );
    
    fireEvent.press(getByText('Test'));
    expect(mockOnPress).toHaveBeenCalled();
  });
});
```

## 🎨 Design Guidelines

### UI/UX Principles

- **Accessibility First**: Ensure all features are accessible
- **Mobile-First**: Design for mobile, enhance for larger screens
- **Consistency**: Use the design system components
- **Performance**: Optimize for smooth animations and interactions

### Design System

- Use the unified theme system (`src/styles/theme.js`)
- Follow spacing and typography guidelines
- Use semantic color names
- Ensure proper contrast ratios (WCAG AA compliance)

### Assets

- **Images**: Use WebP format when possible, provide fallbacks
- **Icons**: Use SVG format, ensure they're accessible
- **Fonts**: Include proper licensing information

## 🌍 Internationalization (i18n)

### Adding New Languages

1. Create language files in `src/locales/`
2. Follow the existing structure
3. Test with different text lengths
4. Consider RTL languages if applicable

### Translation Guidelines

- Keep translations contextual and natural
- Consider cultural differences
- Test UI layout with longer translations
- Use placeholders for dynamic content

## 🐛 Bug Reports

### Before Reporting

- Search existing issues to avoid duplicates
- Test on the latest version
- Try to reproduce the issue consistently

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- Device: [e.g. iPhone 12, Samsung Galaxy S21]
- OS: [e.g. iOS 15.0, Android 11]
- App Version: [e.g. 1.0.0]

**Additional context**
Any other context about the problem.
```

## 💡 Feature Requests

### Before Requesting

- Check if the feature already exists
- Search existing feature requests
- Consider if it aligns with AYNAMODA's goals

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Other solutions or features you've considered.

**Additional context**
Screenshots, mockups, or examples.
```

## 📖 Documentation

### Types of Documentation

- **Code Comments**: Explain complex logic
- **README Files**: Setup and usage instructions
- **API Documentation**: Service and function documentation
- **User Guides**: End-user documentation

### Documentation Standards

- Use clear, concise language
- Include code examples
- Keep documentation up-to-date
- Use proper markdown formatting

## 🔍 Code Review Process

### For Contributors

- Ensure your PR is ready for review
- Respond to feedback promptly
- Make requested changes in new commits
- Keep discussions respectful and constructive

### Review Criteria

- **Functionality**: Does it work as intended?
- **Code Quality**: Is it readable and maintainable?
- **Performance**: Does it impact app performance?
- **Security**: Are there any security concerns?
- **Testing**: Are there adequate tests?
- **Documentation**: Is documentation updated?

## 🏆 Recognition

We appreciate all contributions! Contributors will be:

- Listed in our CONTRIBUTORS.md file
- Mentioned in release notes for significant contributions
- Invited to join our contributor Discord channel
- Eligible for contributor swag (for significant contributions)

## 📞 Getting Help

- **Discord**: Join our contributor channel
- **GitHub Discussions**: For general questions
- **Issues**: For bug reports and feature requests
- **Email**: contribute@aynamoda.com

## 📜 Code of Conduct

### Our Pledge

We are committed to making participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- Harassment, trolling, or discriminatory comments
- Personal attacks or insults
- Publishing private information without permission
- Any conduct that could reasonably be considered inappropriate

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported to the project team at conduct@aynamoda.com. All complaints will be reviewed and investigated promptly and fairly.

## ✅ Definition of Done (Tamamlanma Tanımı)

AYNAMODA projesinde bir görevin "tamamlandı" sayılabilmesi için aşağıdaki kriterlerin **tamamının** karşılanması gerekmektedir:

### Zorunlu Kriterler

1. **Kod Derleme Başarısı**
   - Kod geliştirici makinesinde hatasız derlenmelidir
   - `npm start` veya `expo start` komutu başarıyla çalışmalıdır
   - TypeScript hataları bulunmamalıdır

2. **GitHub Entegrasyonu**
   - Kod GitHub'a push edilmelidir
   - Pull Request oluşturulmalıdır
   - PR açıklaması değişiklikleri net şekilde açıklamalıdır

3. **CI/CD Kontrolü**
   - GitHub Actions'daki tüm kontroller başarıyla geçmelidir
   - Lint kontrolleri geçmelidir
   - Build işlemi başarıyla tamamlanmalıdır

4. **Code Review**
   - En az bir takım üyesi tarafından kod incelenmelidir
   - Tüm review yorumları çözülmelidir

### Path Aliasing Standartları

**FAANG Standardı**: Proje genelinde `@/` prefix'i ile path aliasing kullanılmalıdır:

```typescript
// ✅ Doğru
import { DesignSystem } from '@/theme/DesignSystem';
import { WardrobeService } from '@/services/wardrobeService';
import { WardrobeItem } from '@/types/wardrobe';

// ❌ Yanlış
import { DesignSystem } from '../../src/theme/DesignSystem';
import { WardrobeService } from '../services/wardrobeService';
```

**Mevcut Path Alias Konfigürasyonu:**
```json
{
  "@/*": ["./src/*"],
  "@/components/*": ["./src/components/*"],
  "@/hooks/*": ["./src/hooks/*"],
  "@/services/*": ["./src/services/*"],
  "@/theme/*": ["./src/theme/*"],
  "@/types/*": ["./src/types/*"],
  "@/utils/*": ["./src/utils/*"]
}
```

### Performans ve Kalite Standartları

- **React Native Animasyonları**: `react-native-reanimated` ile native thread'de çalışmalıdır
- **State Management**: Zustand kullanılmalıdır
- **TypeScript**: Strict mode aktif olmalı, `any` tipi kullanımından kaçınılmalıdır
- **UI/UX**: DesignSystem'den değerler kullanılmalıdır
- **Test Coverage**: %80'in üzerinde olmalıdır

## 📄 License

By contributing to AYNAMODA, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

**Thank you for contributing to AYNAMODA! Together, we're building the future of sustainable fashion technology.** 🌱👗✨