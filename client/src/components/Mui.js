// MUI 참고 해보기

import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';


function Mui(){
    return<>
        별점
        <Stack spacing={1}>
            {/* Rating이라는 컴포넌트를 가져다 써본거임 (precision라는 props) */}
            {/* defaultValue=기본 별 개수 / precision는 몇개씩 쪼개서 줄건지 */}
            <Rating name="half-rating" defaultValue={4} precision={0.5} />
            <Rating name="half-rating-read" defaultValue={2.5} precision={0.5} readOnly />
            <Rating name="size-large" defaultValue={2} size="large" />
        </Stack>
    
    </>
}

export default Mui;