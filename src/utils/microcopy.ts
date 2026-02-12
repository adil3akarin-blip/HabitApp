export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return 'Still up? You\'re dedicated';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Winding down?';
}

export function getProgressMessage(done: number, total: number): string {
  if (total === 0) return 'Start your journey';
  const ratio = done / total;
  if (ratio === 0) return 'Let\'s get started today';
  if (ratio < 0.5) return 'You\'re building momentum';
  if (ratio < 1) return 'Almost there, keep going!';
  return 'All done! You crushed it today';
}

export function getStreakMessage(streak: number): string {
  if (streak === 0) return '';
  if (streak === 1) return 'Day 1 — it starts here';
  if (streak < 7) return `${streak} days strong`;
  if (streak === 7) return 'One week! Incredible';
  if (streak < 30) return `${streak} day streak — unstoppable`;
  if (streak === 30) return '30 days! A new you';
  return `${streak} days — legendary`;
}

export function getCompletionMessage(): string {
  const messages = [
    'Nice one!',
    'Keep it up!',
    'Locked in',
    'On fire',
    'Crushed it',
    'That\'s the way',
    'Consistent',
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

export function getAllDoneMessage(): string {
  const messages = [
    'Perfect day',
    'You showed up for yourself',
    'Every habit checked — respect',
    'Nothing left undone',
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}
