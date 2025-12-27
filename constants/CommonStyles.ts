import { StyleSheet } from 'react-native';

export const CommonStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontWeight: '700',
  },
  
  // Form styles
  label: {
    marginBottom: 12,
    fontWeight: '500',
  },
  section: {
    marginVertical: 16,
  },
  
  // Button group styles
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  buttonGroupItem: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  buttonGroupText: {
    fontWeight: '600',
  },
  
  // Text area styles
  textAreaContainer: {
    marginVertical: 16,
  },
  textArea: {
    borderWidth: 1,
    marginTop: 8,
    minHeight: 150,
  },
  textAreaInput: {
    textAlignVertical: 'top',
    padding: 12,
    minHeight: 150,
  },
  
  // Attachment button
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 8,
  },
  attachText: {
    fontWeight: '500',
  },
});

