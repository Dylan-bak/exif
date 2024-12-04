#!/bin/bash

set -e

COMMITS_TO_CHANGE=$1

# OS 감지
if [[ "$OSTYPE" == "darwin"* ]]; then
    IS_MAC=true
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    IS_MAC=false
else
    echo "Unsupported operating system"
    exit 1
fi

# 현재 브랜치 이름 가져오기
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# temp_branch가 존재하면 삭제
git branch -D temp_branch 2>/dev/null || true

# 임시 브랜치 생성
git checkout -b temp_branch

# 변경할 커밋들의 해시를 배열에 저장
COMMIT_HASHES=($(git log -n $COMMITS_TO_CHANGE --format="%H"))

# 오늘 날짜를 기준으로 설정
if $IS_MAC; then
    LATEST_COMMIT_DATE=$(date -v+0d "+%Y-%m-%d %H:%M:%S %z")
else
    LATEST_COMMIT_DATE=$(date "+%Y-%m-%d %H:%M:%S %z")
fi

# interactive rebase를 시작하지만 편집을 중단
if $IS_MAC; then
    GIT_SEQUENCE_EDITOR="sed -i '' '1,$COMMITS_TO_CHANGE s/pick/edit/'" git rebase -i HEAD~$COMMITS_TO_CHANGE
else
    GIT_SEQUENCE_EDITOR="sed -i '1,$COMMITS_TO_CHANGE s/pick/edit/'" git rebase -i HEAD~$COMMITS_TO_CHANGE
fi

TOTAL_COMMITS=${#COMMIT_HASHES[@]}

for i in $(seq 0 $((${#COMMIT_HASHES[@]} - 1)))
do
  COMMIT_HASH=${COMMIT_HASHES[$i]}
  
  # JavaScript를 사용하여 날짜 생성
  NEW_DATE=$(node -e "
    const latestDate = new Date('$LATEST_COMMIT_DATE');
    const targetDate = new Date(latestDate);
    targetDate.setDate(targetDate.getDate() - ($TOTAL_COMMITS - $i)); 
    const randomHour = Math.floor(Math.random() * (24 - 19) + 19);
    const randomMinute = Math.floor(Math.random() * 60);
    const randomSecond = Math.floor(Math.random() * 60);
    targetDate.setHours(randomHour, randomMinute, randomSecond);

    const pad = (num) => (num < 10 ? '0' + num : num);
    const formattedDate = \`\${targetDate.getFullYear()}-\${pad(targetDate.getMonth() + 1)}-\${pad(targetDate.getDate())} \${pad(targetDate.getHours())}:\${pad(targetDate.getMinutes())}:\${pad(targetDate.getSeconds())}\`;

    console.log(formattedDate);
  ")

  # 커밋 날짜 변경
  if [ -n "$NEW_DATE" ]; then
    GIT_COMMITTER_DATE="$NEW_DATE" GIT_AUTHOR_DATE="$NEW_DATE" git commit --amend --no-edit --date="$NEW_DATE"
    
    # 변경된 커밋 로그 출력
    echo "Changed commit date to: $NEW_DATE"
    git log -1 --pretty=format:"%h %ad %s" --date=iso
    echo ""
  else
    echo "Error: Failed to generate date for commit $i"
    exit 1
  fi

  # 다음 커밋으로 이동
  git rebase --continue
done

# 원래 브랜치로 돌아가기
git checkout $CURRENT_BRANCH

# 임시 브랜치의 변경사항을 현재 브랜치로 가져오기
git reset --hard temp_branch

# 임시 브랜치 삭제 (강제 삭제)
git branch -D temp_branch

echo "완료되었습니다. 변경된 커밋을 확인해보세요."
git log -n $COMMITS_TO_CHANGE --pretty=format:"%h %ad %s" --date=iso