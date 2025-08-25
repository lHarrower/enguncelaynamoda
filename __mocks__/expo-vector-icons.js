const React = require('react');
const { Text } = require('react-native');

function IconMock(props) {
  const { name = 'icon', size = 16, color = 'black' } = props;
  return React.createElement(
    Text,
    { accessibilityLabel: `icon-${name}`, style: { fontSize: size, color } },
    '',
  );
}

module.exports = {
  Ionicons: IconMock,
  MaterialIcons: IconMock,
  FontAwesome: IconMock,
  Entypo: IconMock,
  Feather: IconMock,
  AntDesign: IconMock,
  EvilIcons: IconMock,
  Foundation: IconMock,
  MaterialCommunityIcons: IconMock,
};
