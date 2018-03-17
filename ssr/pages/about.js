import Head from "next/head";
import Link from "next/link";

const style = {
  container: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  text: {
    fontSize: "10rem"
  }
};

export default () => (
  <div style={Object.assign({ backgroundColor: "orange" }, style.container)}>
    <Head>
      <style>html, body, #__next {"{height:100%;margin:0;}"}</style>
    </Head>
    <Link href="/">
      <a style={style.text}>Home</a>
    </Link>
    <span style={style.text}>About</span>
  </div>
);
