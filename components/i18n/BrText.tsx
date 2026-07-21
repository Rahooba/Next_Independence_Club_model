import { Fragment } from 'react';

interface BrTextProps {
  text: string;
}

export function BrText({ text }: BrTextProps) {
  return text.split(/<br\s*\/?>/).map((part, i, arr) => (
    <Fragment key={i}>
      {part}
      {i < arr.length - 1 && <br />}
    </Fragment>
  ));
}
