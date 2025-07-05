type Entry = {
    picks: number;
    box: number;
  };
  
  export function expandRepeats(entries: Entry[]): Entry[] {
    const stack: { startIndex: number; type: number }[] = [];
    const result: Entry[] = [];
  
    let i = 0;
    while (i < entries.length) {
      const entry = entries[i];
  
      if (entry.box === 12 || entry.box === 13) {
        const repeatType = entry.box === 12 ? 1 : 2;
  
        // Check if this is a closing marker
        const existingRepeat = stack.findLast((s) => s.type === repeatType);
        if (existingRepeat) {
          const { startIndex } = existingRepeat;
          const repeatBlock = entries.slice(startIndex + 1, i); // Exclude marker itself
          result.push(entry); // include the closing marker itself too
  
          // Repeat that block once
          result.push(...repeatBlock.map((e) => ({ ...e })));
  
          stack.splice(stack.indexOf(existingRepeat), 1); // pop it from stack
        } else {
          // Opening marker
          stack.push({ startIndex: result.length, type: repeatType });
          result.push(entry); // include marker
        }
      } else {
        result.push(entry);
      }
  
      i++;
    }
  
    return result;
  }
  