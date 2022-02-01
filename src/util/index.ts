const recursivelyFindChildren = (obj: { [char: string]: string }, searchKey: string, results: any[] = []) => {
  const r = results;

  Object.keys(obj).forEach(key => {
    const value: any = obj[key];
    if(key === searchKey){
      r.push(value.toString());
    } else if(key === 'children' && obj[key].length){
      value.forEach((obj: { [char: string]: string }) => recursivelyFindChildren(obj, searchKey, r));
    }
  });

  return r;
};

export { recursivelyFindChildren };