declare module '@react-native-seoul/masonry-list' {
  import * as React from 'react';
  import { FlatListProps } from 'react-native';

  export interface MasonryListProps<T> extends FlatListProps<T> {
    numColumns?: number;
  }

  export default class MasonryList<T> extends React.Component<MasonryListProps<T>> {}
} 