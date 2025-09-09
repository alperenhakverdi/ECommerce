import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Select,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Checkbox,
  Button,
  Divider,
  useColorModeValue,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { FiX } from 'react-icons/fi';
import { ProductSearchFilters, Category, Store } from '../../types';
import StarRating from '../Review/StarRating';

interface SearchFiltersProps {
  filters: ProductSearchFilters;
  onFiltersChange: (filters: ProductSearchFilters) => void;
  availableCategories: Category[];
  availableStores: Store[];
  priceRange: { min: number; max: number };
  isLoading?: boolean;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  availableCategories,
  availableStores,
  priceRange,
  isLoading = false,
}) => {
  const [localPriceRange, setLocalPriceRange] = useState([
    filters.minPrice || priceRange.min,
    filters.maxPrice || priceRange.max,
  ]);

  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    setLocalPriceRange([
      filters.minPrice || priceRange.min,
      filters.maxPrice || priceRange.max,
    ]);
  }, [filters.minPrice, filters.maxPrice, priceRange]);

  const handleFilterChange = (key: keyof ProductSearchFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handlePriceRangeChange = (values: number[]) => {
    setLocalPriceRange(values);
  };

  const handlePriceRangeChangeEnd = (values: number[]) => {
    onFiltersChange({
      ...filters,
      minPrice: values[0] === priceRange.min ? undefined : values[0],
      maxPrice: values[1] === priceRange.max ? undefined : values[1],
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      searchTerm: filters.searchTerm, // Keep the search query
    });
    setLocalPriceRange([priceRange.min, priceRange.max]);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.categoryId) count++;
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) count++;
    if (filters.inStockOnly !== undefined) count++;
    if (filters.storeId) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Box
      bg={bgColor}
      border="1px"
      borderColor={borderColor}
      borderRadius="lg"
      p={4}
      h="fit-content"
      position="sticky"
      top="4"
    >
      <VStack spacing={4} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <HStack spacing={2}>
            <Text fontSize="lg" fontWeight="semibold">
              Filters
            </Text>
            {activeFiltersCount > 0 && (
              <Badge colorScheme="blue" fontSize="xs">
                {activeFiltersCount}
              </Badge>
            )}
          </HStack>
          {activeFiltersCount > 0 && (
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<FiX />}
              onClick={handleClearFilters}
              isDisabled={isLoading}
            >
              Clear
            </Button>
          )}
        </HStack>

        <Divider />

        <Accordion allowMultiple defaultIndex={[0, 1, 2, 3, 4]}>
          {/* Category Filter */}
          <AccordionItem>
            <AccordionButton px={0}>
              <Box flex="1" textAlign="left">
                <Text fontWeight="medium">Category</Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel px={0}>
              <Select
                placeholder="All Categories"
                value={filters.categoryId || ''}
                onChange={(e) =>
                  handleFilterChange('categoryId', e.target.value || undefined)
                }
                isDisabled={isLoading}
              >
                {availableCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </AccordionPanel>
          </AccordionItem>

          {/* Price Range Filter */}
          <AccordionItem>
            <AccordionButton px={0}>
              <Box flex="1" textAlign="left">
                <Text fontWeight="medium">Price Range</Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel px={0}>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">
                    ${localPriceRange[0]}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    ${localPriceRange[1]}
                  </Text>
                </HStack>
                
                <RangeSlider
                  min={priceRange.min}
                  max={priceRange.max}
                  step={1}
                  value={localPriceRange}
                  onChange={handlePriceRangeChange}
                  onChangeEnd={handlePriceRangeChangeEnd}
                  isDisabled={isLoading}
                >
                  <RangeSliderTrack>
                    <RangeSliderFilledTrack />
                  </RangeSliderTrack>
                  <RangeSliderThumb index={0} />
                  <RangeSliderThumb index={1} />
                </RangeSlider>

                <HStack spacing={2}>
                  <NumberInput
                    size="sm"
                    min={priceRange.min}
                    max={priceRange.max}
                    value={localPriceRange[0]}
                    onChange={(_, value) => {
                      if (!isNaN(value)) {
                        const newRange = [value, localPriceRange[1]];
                        setLocalPriceRange(newRange);
                        handlePriceRangeChangeEnd(newRange);
                      }
                    }}
                    isDisabled={isLoading}
                  >
                    <NumberInputField placeholder="Min" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  
                  <Text>-</Text>
                  
                  <NumberInput
                    size="sm"
                    min={priceRange.min}
                    max={priceRange.max}
                    value={localPriceRange[1]}
                    onChange={(_, value) => {
                      if (!isNaN(value)) {
                        const newRange = [localPriceRange[0], value];
                        setLocalPriceRange(newRange);
                        handlePriceRangeChangeEnd(newRange);
                      }
                    }}
                    isDisabled={isLoading}
                  >
                    <NumberInputField placeholder="Max" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </HStack>
              </VStack>
            </AccordionPanel>
          </AccordionItem>


          {/* Store Filter */}
          <AccordionItem>
            <AccordionButton px={0}>
              <Box flex="1" textAlign="left">
                <Text fontWeight="medium">Store</Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel px={0}>
              <Select
                placeholder="All Stores"
                value={filters.storeId || ''}
                onChange={(e) =>
                  handleFilterChange('storeId', e.target.value || undefined)
                }
                isDisabled={isLoading}
              >
                {availableStores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </Select>
            </AccordionPanel>
          </AccordionItem>

          {/* Availability Filter */}
          <AccordionItem>
            <AccordionButton px={0}>
              <Box flex="1" textAlign="left">
                <Text fontWeight="medium">Availability</Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel px={0}>
              <Checkbox
                isChecked={filters.inStockOnly === true}
                onChange={(e) =>
                  handleFilterChange('inStockOnly', e.target.checked ? true : undefined)
                }
                isDisabled={isLoading}
              >
                In Stock Only
              </Checkbox>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </VStack>
    </Box>
  );
};

export default SearchFilters;