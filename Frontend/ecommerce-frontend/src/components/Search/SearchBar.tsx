import React, { useState, useRef } from 'react';
import {
  InputGroup,
  Input,
  InputRightElement,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiSearch, FiX } from 'react-icons/fi';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = "Search products...",
  size = 'md',
  isLoading = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const borderColor = useColorModeValue('gray.300', 'gray.600');
  const focusBorderColor = useColorModeValue('blue.500', 'blue.300');
  const bgColor = useColorModeValue('white', 'gray.700');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSearch(value.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const handleSearchClick = () => {
    if (value.trim()) {
      onSearch(value.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <InputGroup size={size}>
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          bg={bgColor}
          borderColor={isFocused ? focusBorderColor : borderColor}
          _hover={{
            borderColor: focusBorderColor,
          }}
          _focus={{
            borderColor: focusBorderColor,
            boxShadow: `0 0 0 1px ${focusBorderColor}`,
          }}
          pr={value ? '72px' : '40px'}
        />
        <InputRightElement width={value ? '72px' : '40px'}>
          {value && (
            <IconButton
              aria-label="Clear search"
              icon={<FiX />}
              size="xs"
              variant="ghost"
              onClick={handleClear}
              mr={1}
            />
          )}
          <IconButton
            aria-label="Search"
            icon={<FiSearch />}
            size="xs"
            variant="ghost"
            onClick={handleSearchClick}
            isLoading={isLoading}
            type="submit"
          />
        </InputRightElement>
      </InputGroup>
    </form>
  );
};

export default SearchBar;