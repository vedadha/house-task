import type { Category, Task } from './models';
import { FREQUENCY_DAILY, FREQUENCY_WEEKLY } from './constants';

export const getDefaultCategories = (): Omit<Category, 'id'>[] => [
  { name: 'Living Room', icon: 'Sofa', color: '#E3F2FD' },
  { name: 'Kitchen', icon: 'ChefHat', color: '#FFF3E0' },
  { name: 'Bedroom', icon: 'Bed', color: '#F3E5F5' },
  { name: 'Bathroom', icon: 'Bath', color: '#E0F2F1' },
  { name: 'Outdoor', icon: 'TreePine', color: '#E8F5E9' },
];

export const getDefaultTasks = (
  categories: Category[]
): Omit<Task, 'id' | 'createdAt'>[] => {
  if (categories.length === 0) return [];

  const firstId = categories[0].id;
  const getCategoryId = (name: string, fallbackId = firstId) =>
    categories.find((cat) => cat.name === name)?.id || fallbackId;

  const livingRoomId = getCategoryId('Living Room');
  const kitchenId = getCategoryId('Kitchen');
  const bedroomId = getCategoryId('Bedroom');
  const bathroomId = getCategoryId('Bathroom');
  const outdoorId = getCategoryId('Outdoor');

  return [
    {
      title: 'Vacuum the carpet',
      categoryId: livingRoomId,
      completedBy: [],
      frequency: FREQUENCY_WEEKLY,
      rating: 1,
    },
    {
      title: 'Dust furniture',
      categoryId: livingRoomId,
      completedBy: [],
      frequency: FREQUENCY_WEEKLY,
      rating: 1,
    },
    {
      title: 'Wash dishes',
      categoryId: kitchenId,
      completedBy: [],
      frequency: FREQUENCY_DAILY,
      rating: 1,
    },
    {
      title: 'Clean countertops',
      categoryId: kitchenId,
      completedBy: [],
      frequency: FREQUENCY_DAILY,
      rating: 1,
    },
    {
      title: 'Take out trash',
      categoryId: kitchenId,
      completedBy: [],
      frequency: FREQUENCY_DAILY,
      rating: 1,
    },
    {
      title: 'Binxi food/water',
      categoryId: kitchenId,
      completedBy: [],
      frequency: FREQUENCY_DAILY,
      rating: 2,
    },
    {
      title: 'Breakfast',
      categoryId: kitchenId,
      completedBy: [],
      frequency: FREQUENCY_DAILY,
      rating: 2,
    },
    {
      title: 'Lunch',
      categoryId: kitchenId,
      completedBy: [],
      frequency: FREQUENCY_DAILY,
      rating: 3,
    },
    {
      title: 'Market',
      categoryId: kitchenId,
      completedBy: [],
      frequency: FREQUENCY_DAILY,
      rating: 1,
    },
    {
      title: 'Dishwasher',
      categoryId: kitchenId,
      completedBy: [],
      frequency: FREQUENCY_DAILY,
      rating: 2,
    },
    {
      title: 'Washing Machine',
      categoryId: bathroomId,
      completedBy: [],
      frequency: FREQUENCY_DAILY,
      rating: 2,
    },
    {
      title: 'Dinner',
      categoryId: kitchenId,
      completedBy: [],
      frequency: FREQUENCY_DAILY,
      rating: 3,
    },
    {
      title: 'Make beds',
      categoryId: bedroomId,
      completedBy: [],
      frequency: FREQUENCY_DAILY,
      rating: 1,
    },
    {
      title: 'Change bedsheets',
      categoryId: bedroomId,
      completedBy: [],
      frequency: FREQUENCY_WEEKLY,
      rating: 1,
    },
    {
      title: 'Clean toilet',
      categoryId: bathroomId,
      completedBy: [],
      frequency: FREQUENCY_WEEKLY,
      rating: 1,
    },
    {
      title: 'Wipe mirrors',
      categoryId: bathroomId,
      completedBy: [],
      frequency: FREQUENCY_WEEKLY,
      rating: 1,
    },
    {
      title: 'Clean kitchen',
      categoryId: kitchenId,
      completedBy: [],
      frequency: FREQUENCY_WEEKLY,
      rating: 1,
    },
    {
      title: 'Water plants',
      categoryId: outdoorId,
      completedBy: [],
      frequency: FREQUENCY_WEEKLY,
      rating: 1,
    },
    {
      title: 'Car wash',
      categoryId: outdoorId,
      completedBy: [],
      frequency: FREQUENCY_WEEKLY,
      rating: 1,
    },
  ];
};
