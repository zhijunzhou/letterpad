import React, { Component } from "react";
import PropTypes from "prop-types";
import { translate } from "react-i18next";

import { ProgressText, Spinner } from "./index.css";

import StyledCard from "../../components/card";
import StyledSection from "../../components/section";
import Button from "../../components/button";
import Link from "../../components/link";
import Input from "../../components/input";

class CreatePr extends Component {
  state = {
    creatingPr: false,
  };

  pullRequestStatus = React.createRef();

  createPullRequest = async () => {
    this.setState({ creatingPr: true });
    this.pullRequestStatus.current.textContent = "";

    const reader = await this.props.sendRequest(
      "http://localhost:4040/admin/create-pull-request",
    );

    const readStream = reader => {
      return reader.read().then(result => {
        if (result.done) {
          return this.setProgressWidth();
        }
        const chunk = result.value;
        // read the response
        const { message } = this.props.chunkToJSON(chunk);
        if (message === "done") {
          this.pullRequestStatus.current.innerHTML += "<br> > All Done!";
          this.setState({ creatingPr: false });
          return reader.cancel();
        }
        this.pullRequestStatus.current.innerHTML += "<br> > " + message;
        return readStream(reader);
      });
    };
    readStream(reader);
  };

  render() {
    const { data, t } = this.props;

    return (
      <StyledSection>
        <div>
          <StyledCard
            title="Create a Pull Request"
            subtitle="Use github to version your website"
          >
            We use the hub library to create a pull request. This is not
            installed by letterpad.{" "}
            <Link
              to="https://github.com/github/hub"
              rel="noopener noreferrer"
              target="_blank"
            >
              Click here
            </Link>{" "}
            for installation instructions.
            <br />
            <br />
            <Input
              label="Github Repository Name"
              defaultValue={data.github_repo.value}
              type="text"
              placeholder={t("settings.static.github.placeholder")}
              onBlur={e =>
                this.props.updateOption("github_repo", e.target.value)
              }
            />
            <small>(Make sure that the Github Repository exist)</small>
            <ProgressText>
              <br />
              {this.state.creatingPr && <Spinner />}
              <span ref={this.pullRequestStatus} />
            </ProgressText>
            <br />
            <Button success sm onClick={this.createPullRequest}>
              Create PR
            </Button>
          </StyledCard>
        </div>
      </StyledSection>
    );
  }
}

CreatePr.propTypes = {
  data: PropTypes.object,
  updateOption: PropTypes.func,
  chunkToJSON: PropTypes.func,
  sendRequest: PropTypes.func,
  t: PropTypes.func,
  options: PropTypes.object,
};

CreatePr.defaultPropTypes = {
  data: JSON.stringify({
    text_notfound: "",
  }),
};

export default translate("translations")(CreatePr);
