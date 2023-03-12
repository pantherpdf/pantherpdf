import useStateDelayed from '../useStateDelayed';

interface Props {
  min: number;
  max: number;
  value: number;
  onChange: (val: number) => void;
  id?: string;
  label?: string;
  labelClassName?: string;
}

export default function PropertySlider(props: Props) {
  const [value, setValue] = useStateDelayed<number>(
    props.value,
    props.onChange,
  );

  return (
    <>
      {props.label && (
        <label htmlFor={props.id} className={props.labelClassName}>
          {props.label}
          <small className="text-muted ms-2">{value}px</small>
        </label>
      )}
      <input
        type="range"
        id={props.id}
        min={props.min}
        max={props.max}
        value={value}
        onChange={e => setValue(parseInt(e.currentTarget.value), 300)}
        onMouseUp={e => setValue(parseInt(e.currentTarget.value), 0)}
        className="form-range"
      />
    </>
  );
}
