import React from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  HStack,
  VStack,
  Text,
  Box,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  Button,
  Spinner,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

interface QuickStatsCardProps {
  title: string;
  icon: string;
  stats: {
    label: string;
    value: string | number;
    change?: number;
    isLoading?: boolean;
  }[];
  actionButton?: {
    label: string;
    path: string;
    colorScheme?: string;
  };
}

export const QuickStatsCard: React.FC<QuickStatsCardProps> = ({
  title,
  icon,
  stats,
  actionButton,
}) => {
  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Card bg={cardBg} border="1px" borderColor={borderColor}>
      <CardHeader>
        <HStack spacing={3}>
          <Box fontSize="2xl">{icon}</Box>
          <Text fontSize="lg" fontWeight="semibold">
            {title}
          </Text>
        </HStack>
      </CardHeader>
      <CardBody pt={0}>
        <VStack align="stretch" spacing={4}>
          {stats.map((stat, index) => (
            <Stat key={index} size="sm">
              <StatLabel color="gray.500" fontSize="xs">
                {stat.label}
              </StatLabel>
              {stat.isLoading ? (
                <HStack>
                  <Spinner size="sm" />
                  <Text fontSize="sm" color="gray.400">
                    Loading...
                  </Text>
                </HStack>
              ) : (
                <>
                  <StatNumber fontSize="xl">
                    {typeof stat.value === 'number' && stat.value > 1000
                      ? `${(stat.value / 1000).toFixed(1)}k`
                      : stat.value}
                  </StatNumber>
                  {stat.change !== undefined && (
                    <StatHelpText mb={0}>
                      <StatArrow type={stat.change >= 0 ? 'increase' : 'decrease'} />
                      {Math.abs(stat.change)}%
                    </StatHelpText>
                  )}
                </>
              )}
            </Stat>
          ))}
          {actionButton && (
            <Button
              size="sm"
              colorScheme={actionButton.colorScheme || 'blue'}
              variant="outline"
              onClick={() => navigate(actionButton.path)}
            >
              {actionButton.label}
            </Button>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};