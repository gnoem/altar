import styles from "./loader.module.css";

const Loader: React.FC = (): JSX.Element => {
  return (
    <svg viewBox="0 0 100 100" className={styles.Loader}>
      <circle cx="50" cy="50" r="49"></circle>
    </svg>
  )
}

export default Loader;